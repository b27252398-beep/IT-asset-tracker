package com.assettracker.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Immutable audit record for every assignment or status change on an asset.
 * Rows in this table are NEVER updated or deleted — only inserted.
 * Maps to the `assignment_logs` table in Supabase.
 */
@Entity
@Table(name = "assignment_logs")
@Getter
@Setter
@NoArgsConstructor
public class AssignmentLog {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(columnDefinition = "uuid", updatable = false, nullable = false)
    private UUID id;

    /**
     * Foreign key to the asset this log entry belongs to.
     * Loaded lazily to avoid N+1 queries when listing logs.
     */
    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "asset_id", nullable = false)
    private Asset asset;

    /**
     * The action taken. Accepted values:
     *   ASSIGNED | UNASSIGNED | MARKED_REPAIR | MARKED_AVAILABLE
     */
    @NotBlank
    @Column(nullable = false, length = 50)
    private String action;

    /** The user the asset was assigned to (null for non-assignment actions). */
    @Column(name = "assigned_to", length = 100)
    private String assignedTo;

    /** The admin/operator who performed this action. */
    @Column(name = "performed_by", length = 100)
    private String performedBy;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    // --- Convenience constructor used by the service layer ---
    public AssignmentLog(Asset asset, String action, String assignedTo,
                         String performedBy, String notes) {
        this.asset       = asset;
        this.action      = action;
        this.assignedTo  = assignedTo;
        this.performedBy = performedBy;
        this.notes       = notes;
    }
}
