package com.assettracker.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * Represents a physical or logical IT asset in the organisation's inventory.
 * Maps to the `assets` table in Supabase (PostgreSQL).
 */
@Entity
@Table(name = "assets")
@Getter
@Setter
@NoArgsConstructor
public class Asset extends BaseEntity {

    // --- Enums (must match PostgreSQL ENUM types exactly) ---

    public enum Status {
        AVAILABLE, ASSIGNED, IN_REPAIR, RETIRED
    }

    public enum Category {
        LAPTOP, DESKTOP, MONITOR, PRINTER,
        EMBEDDED_SYSTEM, IOT_SENSOR, NETWORK_DEVICE,
        MOBILE_DEVICE, SERVER, OTHER
    }

    // --- Fields ---

    /** Human-readable asset tag, e.g. "ASSET-001". Must be unique. */
    @NotBlank(message = "Asset tag is required")
    @Column(name = "asset_tag", nullable = false, unique = true, length = 50)
    private String assetTag;

    @NotBlank(message = "Asset name is required")
    @Column(nullable = false, length = 150)
    private String name;

    @NotNull(message = "Category is required")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, columnDefinition = "asset_category")
    private Category category;

    @NotNull(message = "Status is required")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, columnDefinition = "asset_status")
    private Status status = Status.AVAILABLE;

    @Column(name = "serial_number", length = 100)
    private String serialNumber;

    /** The person currently holding this asset. Null when unassigned. */
    @Column(name = "current_user", length = 100)
    private String currentUser;

    @Column(length = 150)
    private String location;

    @Column(name = "purchase_date")
    private LocalDate purchaseDate;

    @Column(columnDefinition = "TEXT")
    private String notes;
}
