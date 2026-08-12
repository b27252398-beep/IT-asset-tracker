package com.assettracker.dto;

import com.assettracker.entity.Asset.Category;
import com.assettracker.entity.Asset.Status;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssetDTO {
    private UUID id;
    
    @NotBlank(message = "Asset tag is required")
    private String assetTag;
    
    @NotBlank(message = "Asset name is required")
    private String name;
    
    @NotNull(message = "Category is required")
    private Category category;
    
    private Status status;
    private String serialNumber;
    private String currentUser;
    private String location;
    private LocalDate purchaseDate;
    private String notes;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
