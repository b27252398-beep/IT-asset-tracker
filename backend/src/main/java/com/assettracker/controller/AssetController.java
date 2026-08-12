package com.assettracker.controller;

import com.assettracker.dto.ApiResponse;
import com.assettracker.dto.AssetDTO;
import com.assettracker.entity.AssignmentLog;
import com.assettracker.service.AssetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/assets")
@RequiredArgsConstructor
public class AssetController {

    private final AssetService assetService;

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getDashboardMetrics() {
        return ResponseEntity.ok(ApiResponse.success("Metrics retrieved successfully", assetService.getDashboardMetrics()));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<AssetDTO>>> getAllAssets(@RequestParam(required = false) String status) {
        return ResponseEntity.ok(ApiResponse.success("Assets retrieved successfully", assetService.getAllAssets(status)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AssetDTO>> getAssetById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success("Asset retrieved successfully", assetService.getAssetById(id)));
    }

    @GetMapping("/{id}/logs")
    public ResponseEntity<ApiResponse<List<AssignmentLog>>> getAssetLogs(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success("Asset logs retrieved successfully", assetService.getAssetLogs(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AssetDTO>> createAsset(@Valid @RequestBody AssetDTO assetDTO) {
        AssetDTO created = assetService.createAsset(assetDTO);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Asset created successfully", created));
    }

    @PutMapping("/{id}/assign")
    public ResponseEntity<ApiResponse<AssetDTO>> assignAsset(
            @PathVariable UUID id,
            @RequestBody Map<String, String> payload) {
        
        String assignedTo = payload.get("assignedTo");
        String performedBy = payload.getOrDefault("performedBy", "SYSTEM");

        if (assignedTo == null || assignedTo.isBlank()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("'assignedTo' is required"));
        }

        try {
            AssetDTO updated = assetService.assignAsset(id, assignedTo, performedBy);
            return ResponseEntity.ok(ApiResponse.success("Asset assigned successfully", updated));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<AssetDTO>> updateStatus(
            @PathVariable UUID id,
            @RequestBody Map<String, String> payload) {
        
        String status = payload.get("status");
        String performedBy = payload.getOrDefault("performedBy", "SYSTEM");
        String notes = payload.getOrDefault("notes", "");

        if (status == null || status.isBlank()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("'status' is required"));
        }

        try {
            AssetDTO updated = assetService.updateStatus(id, status, performedBy, notes);
            return ResponseEntity.ok(ApiResponse.success("Status updated successfully", updated));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Invalid status value"));
        }
    }
}
