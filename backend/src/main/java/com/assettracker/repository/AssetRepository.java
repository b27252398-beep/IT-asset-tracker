package com.assettracker.repository;

import com.assettracker.entity.Asset;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * Spring Data JPA repository for the Asset entity.
 * CRUD operations are inherited; custom queries defined below.
 */
@Repository
public interface AssetRepository extends JpaRepository<Asset, UUID> {

    /** Filter assets by status (used for dashboard counts). */
    List<Asset> findByStatus(Asset.Status status);

    /** Filter assets by category. */
    List<Asset> findByCategory(Asset.Category category);

    /** Search assets by name (case-insensitive, partial match). */
    List<Asset> findByNameContainingIgnoreCase(String name);

    /**
     * Dashboard summary: returns count per status in one query.
     * Returns Object[] rows: [status (String), count (Long)]
     */
    @Query("SELECT a.status, COUNT(a) FROM Asset a GROUP BY a.status")
    List<Object[]> countByStatus();
}
