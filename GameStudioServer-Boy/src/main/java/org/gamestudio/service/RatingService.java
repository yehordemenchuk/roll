package org.gamestudio.service;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.gamestudio.dto.request.RatingRequest;
import org.gamestudio.dto.response.AverageRatingResponse;
import org.gamestudio.dto.response.RatingResponse;
import org.gamestudio.entity.Rating;
import org.gamestudio.mapper.RatingMapper;
import org.gamestudio.repository.RatingJpaRepository;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RatingService {
    private final RatingMapper ratingMapper;
    private final RatingJpaRepository ratingJpaRepository;

    @Transactional
    public RatingResponse saveRating(RatingRequest ratingRequest) {
        Rating rating = ratingJpaRepository.save(ratingMapper.fromRequest(ratingRequest));

        return ratingMapper.toResponse(rating);
    }

    @Transactional(readOnly = true)
    public RatingResponse findRatingById(long id) throws EntityNotFoundException {
        Rating rating = ratingJpaRepository.findById(id).orElseThrow(EntityNotFoundException::new);

        return ratingMapper.toResponse(rating);
    }

    @Transactional(readOnly = true)
    public RatingResponse findRatingByGameAndPlayer(String game, String player) {
        Rating rating = ratingJpaRepository.findRatingByGameAndPlayer(game, player);

        return ratingMapper.toResponse(rating);
    }

    @Transactional(readOnly = true)
    public AverageRatingResponse getAverageRatingByGame(String game) {
        return new AverageRatingResponse(ratingJpaRepository.getAverageRatingByGame(game));
    }

    @Transactional(readOnly = true)
    public List<RatingResponse> findAllRatings() {
        return ratingJpaRepository.findAll()
                .stream()
                .map(ratingMapper::toResponse)
                .toList();
    }

    @Transactional
    public void deleteRatingById(long id) throws EntityNotFoundException {
        if (!ratingJpaRepository.existsById(id)) {
            throw new EntityNotFoundException();
        }

        ratingJpaRepository.deleteById(id);
    }

    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "rating"),
            @CacheEvict(value = "ratings", allEntries = true),
            @CacheEvict(value = "ratingByGameAndPlayer", allEntries = true),
            @CacheEvict(value = "averageRating", allEntries = true)
    })
    public void deleteAllRatings() {
        ratingJpaRepository.deleteAll();
    }
}
