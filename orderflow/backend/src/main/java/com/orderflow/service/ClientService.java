package com.orderflow.service;

import com.orderflow.dto.*;
import com.orderflow.model.*;
import com.orderflow.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ClientService {

    private final ClientRepository clientRepo;
    private final ClientProductRepository cpRepo;
    private final ProductRepository productRepo;
    private final MapperService mapper;

    public List<ClientDto> getAll() {
        return clientRepo.findAll().stream().map(mapper::toClientDto).collect(Collectors.toList());
    }

    public ClientDto getById(Long id) {
        return mapper.toClientDto(clientRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Client not found: " + id)));
    }

    public ClientDto create(ClientDto dto) {
        if (clientRepo.existsByCode(dto.getCode()))
            throw new RuntimeException("Client code already exists: " + dto.getCode());
        Client c = Client.builder()
                .code(dto.getCode()).name(dto.getName()).gstNo(dto.getGstNo())
                .billingAddress(dto.getBillingAddress()).shippingAddress(dto.getShippingAddress())
                .phone(dto.getPhone()).email(dto.getEmail()).salesperson(dto.getSalesperson()).areaCode(dto.getAreaCode())
                .creditLimit(dto.getCreditLimit() != null ? dto.getCreditLimit() : java.math.BigDecimal.ZERO)
                .paymentTerms(dto.getPaymentTerms() != null ? dto.getPaymentTerms() : "Net 30")
                .gstPercent(dto.getGstPercent() != null ? dto.getGstPercent() : 18)
                .pyOutstanding(dto.getPyOutstanding() != null ? dto.getPyOutstanding() : java.math.BigDecimal.ZERO)
                .cyOutstanding(dto.getCyOutstanding() != null ? dto.getCyOutstanding() : java.math.BigDecimal.ZERO)
                .status(dto.getStatus() != null ? Client.ClientStatus.valueOf(dto.getStatus()) : Client.ClientStatus.ACTIVE)
                .build();
        return mapper.toClientDto(clientRepo.save(c));
    }

    public ClientDto update(Long id, ClientDto dto) {
        Client c = clientRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Client not found: " + id));
        c.setCode(dto.getCode()); c.setName(dto.getName()); c.setGstNo(dto.getGstNo());
        c.setBillingAddress(dto.getBillingAddress()); c.setShippingAddress(dto.getShippingAddress());
        c.setPhone(dto.getPhone()); c.setEmail(dto.getEmail()); c.setSalesperson(dto.getSalesperson()); c.setAreaCode(dto.getAreaCode());
        if (dto.getCreditLimit() != null) c.setCreditLimit(dto.getCreditLimit());
        if (dto.getPaymentTerms() != null) c.setPaymentTerms(dto.getPaymentTerms());
        if (dto.getGstPercent() != null) c.setGstPercent(dto.getGstPercent());
        if (dto.getPyOutstanding() != null) c.setPyOutstanding(dto.getPyOutstanding());
        if (dto.getCyOutstanding() != null) c.setCyOutstanding(dto.getCyOutstanding());
        if (dto.getStatus() != null) c.setStatus(Client.ClientStatus.valueOf(dto.getStatus()));
        return mapper.toClientDto(clientRepo.save(c));
    }

    public List<ClientProductDto> getClientProducts(Long clientId) {
        return cpRepo.findByClient_Id(clientId).stream()
                .map(mapper::toClientProductDto).collect(Collectors.toList());
    }

    public ClientProductDto addClientProduct(Long clientId, ClientProductRequest req) {
        Client client = clientRepo.findById(clientId)
                .orElseThrow(() -> new RuntimeException("Client not found: " + clientId));
        Product product = productRepo.findById(req.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found: " + req.getProductId()));
        if (cpRepo.existsByClient_IdAndProduct_Id(clientId, req.getProductId()))
            throw new RuntimeException("Product already mapped to this client");
        ClientProduct cp = ClientProduct.builder()
                .client(client).product(product)
                .agreedPrice(req.getAgreedPrice())
                .stereoRef(req.getStereoRef())
                .specialSpec(req.getSpecialSpec())
                .notes(req.getNotes())
                .active(true).build();
        return mapper.toClientProductDto(cpRepo.save(cp));
    }

    public ClientProductDto updateClientProduct(Long cpId, ClientProductRequest req) {
        ClientProduct cp = cpRepo.findById(cpId)
                .orElseThrow(() -> new RuntimeException("Client product not found: " + cpId));
        if (req.getAgreedPrice() != null) cp.setAgreedPrice(req.getAgreedPrice());
        if (req.getStereoRef() != null) cp.setStereoRef(req.getStereoRef());
        if (req.getSpecialSpec() != null) cp.setSpecialSpec(req.getSpecialSpec());
        if (req.getNotes() != null) cp.setNotes(req.getNotes());
        if (req.getActive() != null) cp.setActive(req.getActive());
        return mapper.toClientProductDto(cpRepo.save(cp));
    }

    public void deleteClientProduct(Long cpId) {
        cpRepo.deleteById(cpId);
    }
}
