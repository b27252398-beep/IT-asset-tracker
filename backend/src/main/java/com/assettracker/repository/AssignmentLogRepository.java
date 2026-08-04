package com.assettracker.repository;

import com.assettracker.model.AssignmentLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * Spring Data JPA repository for AssignmentLog.
 * Rows are append-only; no delete/update methods should be called.
 */
@Repository
public interface AssignmentLogRepository extends JpaRepository<AssignmentLog, UUID> {

    /**
     * Retrieve the full history for a single asset, most-recent first.
     * Used by the asset detail view.
     */
    List<AssignmentLog> findByAssetIdOrderByCreatedAtDesc(UUID assetId);
}
