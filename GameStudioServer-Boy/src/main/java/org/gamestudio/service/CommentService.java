package org.gamestudio.service;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.gamestudio.dto.request.CommentRequest;
import org.gamestudio.dto.response.CommentResponse;
import org.gamestudio.entity.Comment;
import org.gamestudio.mapper.CommentMapper;
import org.gamestudio.repository.CommentJpaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CommentService {
    private final CommentMapper commentMapper;
    private final CommentJpaRepository commentJpaRepository;

    @Transactional
    public CommentResponse createComment(CommentRequest commentRequest) {
        Comment comment = commentJpaRepository.save(commentMapper.fromRequest(commentRequest));

        return commentMapper.toResponse(comment);
    }

    @Transactional(readOnly = true)
    public CommentResponse findCommentById(long id) throws EntityNotFoundException {
        Comment comment = commentJpaRepository.findById(id).orElseThrow(EntityNotFoundException::new);

        return commentMapper.toResponse(comment);
    }

    @Transactional(readOnly = true)
    public List<CommentResponse> findAllComments() {
        return commentJpaRepository.findAll()
                .stream()
                .map(commentMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<CommentResponse> findCommentsByGame(String game) {
        return commentJpaRepository.findCommentsByGame(game)
                .stream()
                .map(commentMapper::toResponse)
                .toList();
    }

    @Transactional
    public void deleteCommentById(long id) throws EntityNotFoundException {
        if (!commentJpaRepository.existsById(id)) {
            throw new EntityNotFoundException();
        }

        commentJpaRepository.deleteById(id);
    }
}
