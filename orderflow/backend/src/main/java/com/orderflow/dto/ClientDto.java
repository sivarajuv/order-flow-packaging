package com.orderflow.dto;

import lombok.*;
import java.math.BigDecimal;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class ClientDto {
    private Long id;
    private String code;
    private String name;
    private String gstNo;
    private String billingAddress;
    private String shippingAddress;
    private String placeOfSupply;
    private String phone;
    private String email;
    private String salesperson;
    private String areaCode;
    private String designFileName;
    private String designUrl;
    private BigDecimal creditLimit;
    private String paymentTerms;
    private Integer gstPercent;
    private BigDecimal pyOutstanding;
    private BigDecimal cyOutstanding;
    private String status;
}
