package com.orderflow.service;

import com.orderflow.dto.ProductDto;
import com.orderflow.model.Product;
import com.orderflow.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ProductService {

    private final ProductRepository productRepo;
    private final MapperService mapper;

    public List<ProductDto> getAll() {
        return productRepo.findAll().stream().map(mapper::toProductDto).collect(Collectors.toList());
    }

    public ProductDto getById(Long id) {
        return mapper.toProductDto(productRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found: " + id)));
    }

    public ProductDto create(ProductDto dto) {
        if (productRepo.existsBySku(dto.getSku()))
            throw new RuntimeException("SKU already exists: " + dto.getSku());
        Product p = Product.builder()
                .sku(dto.getSku()).name(dto.getName()).category(dto.getCategory())
                .size(dto.getSize()).hsnCode(dto.getHsnCode())
                .handle(dto.getHandle() != null ? dto.getHandle() : "None")
                .uom(dto.getUom() != null ? dto.getUom() : "Pcs")
                .basePrice(dto.getBasePrice() != null ? dto.getBasePrice() : java.math.BigDecimal.ZERO)
                .weightGrams(dto.getWeightGrams() != null ? dto.getWeightGrams() : java.math.BigDecimal.ZERO)
                .status(dto.getStatus() != null ? Product.ProductStatus.valueOf(dto.getStatus()) : Product.ProductStatus.ACTIVE)
                .build();
        return mapper.toProductDto(productRepo.save(p));
    }

    public ProductDto update(Long id, ProductDto dto) {
        Product p = productRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found: " + id));
        p.setSku(dto.getSku()); p.setName(dto.getName()); p.setCategory(dto.getCategory());
        p.setSize(dto.getSize()); p.setHsnCode(dto.getHsnCode()); p.setHandle(dto.getHandle()); p.setUom(dto.getUom());
        if (dto.getBasePrice() != null) p.setBasePrice(dto.getBasePrice());
        if (dto.getWeightGrams() != null) p.setWeightGrams(dto.getWeightGrams());
        if (dto.getStatus() != null) p.setStatus(Product.ProductStatus.valueOf(dto.getStatus()));
        return mapper.toProductDto(productRepo.save(p));
    }
}
