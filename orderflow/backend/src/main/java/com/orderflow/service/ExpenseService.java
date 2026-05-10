package com.orderflow.service;

import com.orderflow.dto.ExpenseDto;
import com.orderflow.model.Expense;
import com.orderflow.repository.ExpenseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ExpenseService {

    private final ExpenseRepository expenseRepo;

    public List<ExpenseDto> getAll() {
        return expenseRepo.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public ExpenseDto create(ExpenseDto dto) {
        Expense expense = Expense.builder()
                .expenseDate(dto.getExpenseDate() != null ? LocalDate.parse(dto.getExpenseDate()) : LocalDate.now())
                .category(dto.getCategory())
                .paidTo(dto.getPaidTo())
                .description(dto.getDescription())
                .amount(dto.getAmount() != null ? dto.getAmount() : BigDecimal.ZERO)
                .notes(dto.getNotes())
                .build();
        return toDto(expenseRepo.save(expense));
    }

    private ExpenseDto toDto(Expense expense) {
        return ExpenseDto.builder()
                .id(expense.getId())
                .expenseDate(expense.getExpenseDate() != null ? expense.getExpenseDate().toString() : null)
                .category(expense.getCategory())
                .paidTo(expense.getPaidTo())
                .description(expense.getDescription())
                .amount(expense.getAmount())
                .notes(expense.getNotes())
                .build();
    }
}
