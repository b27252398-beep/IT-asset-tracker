package com.assettracker.service;

import com.assettracker.dto.AssetDTO;
import com.assettracker.entity.Asset;
import com.assettracker.entity.AssignmentLog;
import com.assettracker.exception.ResourceNotFoundException;
import com.assettracker.repository.AssetRepository;
import com.assettracker.repository.AssignmentLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AssetService {

    private final AssetRepository assetRepository;
    private final AssignmentLogRepository logRepository;

    @Transactional(readOnly = true)
    public Map<String, Long> getDashboardMetrics() {
        List<Object[]> rows = assetRepository.countByStatus();
        Map<String, Long> metrics = new HashMap<>();
        
        metrics.put("AVAILABLE", 0L);
        metrics.put("ASSIGNED",  0L);
        metrics.put("IN_REPAIR", 0L);
        metrics.put("RETIRED",   0L);

        for (Object[] row : rows) {
            String statusName = ((Asset.Status) row[0]).name();
            Long count = (Long) row[1];
            metrics.put(statusName, count);
        }

        long total = metrics.values().stream().mapToLong(Long::longValue).sum() - metrics.get("RETIRED");
        metrics.put("TOTAL", total);

        return metrics;
    }

    @Transactional(readOnly = true)
    public List<AssetDTO> getAllAssets(String status) {
        List<Asset> assets;
        if (status != null && !status.isBlank()) {
            Asset.Status s = Asset.Status.valueOf(status.toUpperCase());
            assets = assetRepository.findByStatus(s);
        } else {
            assets = assetRepository.findAll();
        }
        return assets.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AssetDTO getAssetById(UUID id) {
        return mapToDTO(findAssetOrThrow(id));
    }

    @Transactional(readOnly = true)
    public List<AssignmentLog> getAssetLogs(UUID id) {
        findAssetOrThrow(id);
        return logRepository.findByAssetIdOrderByCreatedAtDesc(id);
    }

    @Transactional
    public AssetDTO createAsset(AssetDTO assetDTO) {
        Asset asset = mapToEntity(assetDTO);
        asset.setStatus(Asset.Status.AVAILABLE);
        asset.setCurrentUser(null);

        Asset saved = assetRepository.save(asset);

        logRepository.save(new AssignmentLog(
                saved, "CREATED", null, "SYSTEM", "Asset registered in inventory"));

        return mapToDTO(saved);
    }

    @Transactional
    public AssetDTO assignAsset(UUID id, String assignedTo, String performedBy) {
        Asset asset = findAssetOrThrow(id);

        if (asset.getStatus() != Asset.Status.AVAILABLE) {
            throw new IllegalStateException("Asset is not available for assignment. Current status: " + asset.getStatus());
        }

        asset.setStatus(Asset.Status.ASSIGNED);
        asset.setCurrentUser(assignedTo);
        Asset updated = assetRepository.save(asset);

        logRepository.save(new AssignmentLog(
                updated, "ASSIGNED", assignedTo, performedBy, "Asset assigned to " + assignedTo));

        return mapToDTO(updated);
    }

    @Transactional
    public AssetDTO updateStatus(UUID id, String statusStr, String performedBy, String notes) {
        Asset.Status newStatus = Asset.Status.valueOf(statusStr.toUpperCase());
        Asset asset = findAssetOrThrow(id);
        Asset.Status oldStatus = asset.getStatus();

        asset.setStatus(newStatus);

        if (newStatus == Asset.Status.AVAILABLE || newStatus == Asset.Status.IN_REPAIR || newStatus == Asset.Status.RETIRED) {
            asset.setCurrentUser(null);
        }

        Asset updated = assetRepository.save(asset);

        String logAction = switch (newStatus) {
            case AVAILABLE -> "MARKED_AVAILABLE";
            case IN_REPAIR -> "MARKED_REPAIR";
            case RETIRED   -> "RETIRED";
            default        -> "STATUS_CHANGED";
        };

        logRepository.save(new AssignmentLog(
                updated, logAction, null, performedBy,
                "Status changed from " + oldStatus + " to " + newStatus + (notes != null && !notes.isBlank() ? ": " + notes : "")));

        return mapToDTO(updated);
    }

    private Asset findAssetOrThrow(UUID id) {
        return assetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Asset not found with id: " + id));
    }

    private AssetDTO mapToDTO(Asset asset) {
        return AssetDTO.builder()
                .id(asset.getId())
                .assetTag(asset.getAssetTag())
                .name(asset.getName())
                .category(asset.getCategory())
                .status(asset.getStatus())
                .serialNumber(asset.getSerialNumber())
                .currentUser(asset.getCurrentUser())
                .location(asset.getLocation())
                .purchaseDate(asset.getPurchaseDate())
                .notes(asset.getNotes())
                .createdAt(asset.getCreatedAt())
                .updatedAt(asset.getUpdatedAt())
                .build();
    }

    private Asset mapToEntity(AssetDTO dto) {
        Asset asset = new Asset();
        asset.setAssetTag(dto.getAssetTag());
        asset.setName(dto.getName());
        asset.setCategory(dto.getCategory());
        asset.setSerialNumber(dto.getSerialNumber());
        asset.setLocation(dto.getLocation());
        asset.setPurchaseDate(dto.getPurchaseDate());
        asset.setNotes(dto.getNotes());
        return asset;
    }
}
