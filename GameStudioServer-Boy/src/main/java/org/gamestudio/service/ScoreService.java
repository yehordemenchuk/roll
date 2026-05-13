package org.gamestudio.service;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.gamestudio.dto.request.ScoreRequest;
import org.gamestudio.dto.response.ScoreResponse;
import org.gamestudio.entity.Score;
import org.gamestudio.mapper.ScoreMapper;
import org.gamestudio.repository.ScoreJpaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ScoreService {
    private final ScoreMapper scoreMapper;
    private final ScoreJpaRepository scoreJpaRepository;

    @Transactional
    public ScoreResponse createScore(ScoreRequest scoreRequest) {
        Score score = scoreJpaRepository.save(scoreMapper.fromRequest(scoreRequest));

        return scoreMapper.toResponse(score);
    }

    @Transactional(readOnly = true)
    public ScoreResponse findScoreById(long id) throws EntityNotFoundException {
        Score score = findScoreEntityById(id);

        return scoreMapper.toResponse(score);
    }

    @Transactional(readOnly = true)
    public List<ScoreResponse> findAllScores() {
        return scoreJpaRepository.findAll()
                .stream()
                .map(scoreMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ScoreResponse> findTopByGame(String game) {
        return scoreJpaRepository.findTop10ByGameOrderByPointsDesc(game)
                .stream()
                .map(scoreMapper::toResponse)
                .toList();
    }

    @Transactional
    public ScoreResponse updateScore(long id, ScoreRequest scoreRequest) throws EntityNotFoundException {
        Score score = findScoreEntityById(id);

        scoreMapper.updateScoreFromRequest(scoreRequest, score);

        return scoreMapper.toResponse(score);
    }

    @Transactional
    public void deleteScoreById(long id) throws EntityNotFoundException {
        if (!scoreJpaRepository.existsById(id)) {
            throw new EntityNotFoundException();
        }

        scoreJpaRepository.deleteById(id);
    }

    private Score findScoreEntityById(long id) throws EntityNotFoundException {
        return scoreJpaRepository.findById(id).orElseThrow(EntityNotFoundException::new);
    }
}
