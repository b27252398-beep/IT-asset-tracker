package com.assettracker.controller;

import com.assettracker.model.Asset;
import com.assettracker.model.AssignmentLog;
import com.assettracker.repository.AssetRepository;
import com.assettracker.repository.AssignmentLogRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;

/**
 * REST Controller for IT Asset Tracker.
 * Base path: /api/assets
 *
 * Endpoints:
 *   GET    /api/assets              → List all assets
 *   GET    /api/assets/dashboard    → Live metric counts
 *   GET    /api/assets/{id}         → Single asset by ID
 *   GET    /api/assets/{id}/logs    → Assignment history for an asset
 *   POST   /api/assets              → Create a new asset
 *   PUT    /api/assets/{id}/assign  → Assign asset to a user
 *   PUT    /api/assets/{id}/status  → Change status (AVAILABLE / IN_REPAIR / RETIRED)
 */
@RestController
@RequestMapping("/api/assets")
@RequiredArgsConstructor
public class AssetController {

    private final AssetRepository       assetRepository;
    private final AssignmentLogRepository logRepository;

    // ----------------------------------------------------------------
    // GET /api/assets/dashboard
    // Returns live counts: total, available, assigned, in-repair
    // ----------------------------------------------------------------
    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Long>> getDashboardMetrics() {
        List<Object[]> rows = assetRepository.countByStatus();

        // Build a map with defaults of 0 for every known status
        Map<String, Long> metrics = new HashMap<>();
        metrics.put("AVAILABLE", 0L);
        metrics.put("ASSIGNED",  0L);
        metrics.put("IN_REPAIR", 0L);
        metrics.put("RETIRED",   0L);

        for (Object[] row : rows) {
            String statusName = ((Asset.Status) row[0]).name();
            Long   count      = (Long) row[1];
            metrics.put(statusName, count);
        }

        // Derived: total non-retired assets
        long total = metrics.values().stream().mapToLong(Long::longValue).sum()
                     - metrics.get("RETIRED");
        metrics.put("TOTAL", total);

        return ResponseEntity.ok(metrics);
    }

    // ----------------------------------------------------------------
    // GET /api/assets
    // Returns full asset list; optional ?status= filter
    // ----------------------------------------------------------------
    @GetMapping
    public ResponseEntity<List<Asset>> getAllAssets(
            @RequestParam(required = false) String status) {

        if (status != null && !status.isBlank()) {
            try {
                Asset.Status s = Asset.Status.valueOf(status.toUpperCase());
                return ResponseEntity.ok(assetRepository.findByStatus(s));
            } catch (IllegalArgumentException ex) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Invalid status value: " + status);
            }
        }
        return ResponseEntity.ok(assetRepository.findAll());
    }

    // ----------------------------------------------------------------
    // GET /api/assets/{id}
    // ----------------------------------------------------------------
    @GetMapping("/{id}")
    public ResponseEntity<Asset> getAssetById(@PathVariable UUID id) {
        Asset asset = findAssetOrThrow(id);
        return ResponseEntity.ok(asset);
    }

    // ----------------------------------------------------------------
    // GET /api/assets/{id}/logs
    // Returns assignment history for one asset, newest first
    // ----------------------------------------------------------------
    @GetMapping("/{id}/logs")
    public ResponseEntity<List<AssignmentLog>> getAssetLogs(@PathVariable UUID id) {
        findAssetOrThrow(id); // validate asset exists
        return ResponseEntity.ok(logRepository.findByAssetIdOrderByCreatedAtDesc(id));
    }

    // ----------------------------------------------------------------
    // POST /api/assets
    // Creates a new asset record
    // Request body: Asset JSON (assetTag, name, category, [optional fields])
    // ----------------------------------------------------------------
    @PostMapping
    public ResponseEntity<Asset> createAsset(@Valid @RequestBody Asset asset) {
        // Force a safe default on creation
        asset.setStatus(Asset.Status.AVAILABLE);
        asset.setCurrentUser(null);

        Asset saved = assetRepository.save(asset);

        // Log the creation event
        logRepository.save(new AssignmentLog(
                saved, "CREATED", null, "SYSTEM",
                "Asset registered in inventory"));

        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    // ----------------------------------------------------------------
    // PUT /api/assets/{id}/assign
    // Assigns an AVAILABLE asset to a user
    // Request body: { "assignedTo": "Alice", "performedBy": "Admin" }
    // ----------------------------------------------------------------
    @PutMapping("/{id}/assign")
    public ResponseEntity<Asset> assignAsset(
            @PathVariable UUID id,
            @RequestBody Map<String, String> payload) {

        String assignedTo  = payload.get("assignedTo");
        String performedBy = payload.getOrDefault("performedBy", "SYSTEM");

        if (assignedTo == null || assignedTo.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "'assignedTo' is required in the request body");
        }

        Asset asset = findAssetOrThrow(id);

        if (asset.getStatus() != Asset.Status.AVAILABLE) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Asset is not available for assignment. Current status: "
                    + asset.getStatus());
        }

        asset.setStatus(Asset.Status.ASSIGNED);
        asset.setCurrentUser(assignedTo);
        Asset updated = assetRepository.save(asset);

        logRepository.save(new AssignmentLog(
                updated, "ASSIGNED", assignedTo, performedBy,
                "Asset assigned to " + assignedTo));

        return ResponseEntity.ok(updated);
    }

    // ----------------------------------------------------------------
    // PUT /api/assets/{id}/status
    // Changes status to AVAILABLE, IN_REPAIR, or RETIRED
    // Request body: { "status": "IN_REPAIR", "performedBy": "Admin", "notes": "Screen cracked" }
    // ----------------------------------------------------------------
    @PutMapping("/{id}/status")
    public ResponseEntity<Asset> updateStatus(
            @PathVariable UUID id,
            @RequestBody Map<String, String> payload) {

        String newStatusStr = payload.get("status");
        String performedBy  = payload.getOrDefault("performedBy", "SYSTEM");
        String notes        = payload.getOrDefault("notes", "");

        if (newStatusStr == null || newStatusStr.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "'status' is required in the request body");
        }

        Asset.Status newStatus;
        try {
            newStatus = Asset.Status.valueOf(newStatusStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Invalid status: " + newStatusStr
                    + ". Allowed: AVAILABLE, IN_REPAIR, RETIRED");
        }

        Asset asset = findAssetOrThrow(id);
        Asset.Status oldStatus = asset.getStatus();

        asset.setStatus(newStatus);

        // Clear current user when asset is no longer assigned
        if (newStatus == Asset.Status.AVAILABLE || newStatus == Asset.Status.IN_REPAIR
                || newStatus == Asset.Status.RETIRED) {
            asset.setCurrentUser(null);
        }

        Asset updated = assetRepository.save(asset);

        // Map new status to a readable log action
        String logAction = switch (newStatus) {
            case AVAILABLE -> "MARKED_AVAILABLE";
            case IN_REPAIR -> "MARKED_REPAIR";
            case RETIRED   -> "RETIRED";
            default        -> "STATUS_CHANGED";
        };

        logRepository.save(new AssignmentLog(
                updated, logAction, null, performedBy,
                "Status changed from " + oldStatus + " to " + newStatus
                + (notes.isBlank() ? "" : ": " + notes)));

        return ResponseEntity.ok(updated);
    }

    // ----------------------------------------------------------------
    // Helper: fetch asset by UUID or throw a clean 404
    // ----------------------------------------------------------------
    private Asset findAssetOrThrow(UUID id) {
        return assetRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Asset not found with id: " + id));
    }
}
