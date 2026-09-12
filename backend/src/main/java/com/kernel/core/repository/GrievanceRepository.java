package com.kernel.core.repository;

import com.kernel.core.model.Grievance;
import com.kernel.core.model.enums.Category;
import com.kernel.core.model.enums.GrievanceStatus;
import com.kernel.core.model.enums.Urgency;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GrievanceRepository extends MongoRepository<Grievance, String> {
    Page<Grievance> findByStatus(GrievanceStatus status, Pageable pageable);
    Page<Grievance> findByCategory(Category category, Pageable pageable);
    Page<Grievance> findByUrgency(Urgency urgency, Pageable pageable);
    List<Grievance> findByEmail(String email);
    Optional<Grievance> findByCommunicationToken(String communicationToken);
    
    @Query("{'$or': [{'name': {'$regex': ?0, '$options': 'i'}}, {'email': {'$regex': ?0, '$options': 'i'}}, {'originalGrievance': {'$regex': ?0, '$options': 'i'}}]}")
    Page<Grievance> searchByKeyword(String keyword, Pageable pageable);
}
