package com.orderflow.service;

import com.orderflow.dto.*;
import com.orderflow.model.*;
import com.orderflow.repository.JobCardRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class JobCardService {

    private final JobCardRepository jcRepo;
    private final MapperService mapper;

    public List<JobCardDto> getAll() {
        return jcRepo.findAll().stream().map(mapper::toJobCardDto).collect(Collectors.toList());
    }

    public JobCardDto getById(Long id) {
        return mapper.toJobCardDto(jcRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Job card not found: " + id)));
    }

    public JobCardDto updateStatus(Long id, String status) {
        JobCard jc = jcRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Job card not found: " + id));
        jc.setStatus(JobCard.JobCardStatus.valueOf(status));
        return mapper.toJobCardDto(jcRepo.save(jc));
    }

    public JobCardDto addActivity(Long id, JobActivityRequest req) {
        JobCard jc = jcRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Job card not found: " + id));

        JobActivity activity = JobActivity.builder()
                .jobCard(jc)
                .activityType(JobActivity.ActivityType.valueOf(req.getActivityType()))
                .description(req.getDescription())
                .qty(req.getQty())
                .performedBy(req.getPerformedBy())
                .activityTime(LocalDateTime.now())
                .notes(req.getNotes())
                .build();
        jc.getActivities().add(activity);

        // Auto-advance status
        if (req.getActivityType().equals("DELIVERY")) {
            jc.setStatus(JobCard.JobCardStatus.COMPLETED);
        } else if (jc.getStatus() == JobCard.JobCardStatus.PENDING) {
            jc.setStatus(JobCard.JobCardStatus.IN_PRODUCTION);
        }

        return mapper.toJobCardDto(jcRepo.save(jc));
    }
}
