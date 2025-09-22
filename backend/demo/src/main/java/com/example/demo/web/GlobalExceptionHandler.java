package com.example.demo.web;

import com.example.demo.dto.ErrorResponse;
import com.example.demo.service.exception.InvalidVoteDeltaException;
import com.example.demo.service.exception.OptionNotFoundException;
import com.example.demo.service.exception.VotingLockedException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
public class GlobalExceptionHandler {
    private ErrorResponse base(HttpServletRequest req, HttpStatus status, String message) {
        ErrorResponse err = new ErrorResponse();
        err.setPath(req.getRequestURI());
        err.setStatus(status.value());
        err.setError(status.getReasonPhrase());
        err.setMessage(message);
        return err;
    }

    // Bean Validation on @RequestBody (e.g., CreateOptionRequest)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex,
                                                          HttpServletRequest req) {
        ErrorResponse err = base(req, HttpStatus.BAD_REQUEST, "Validation failed");
        for (FieldError fe : ex.getBindingResult().getFieldErrors()) {
            err.getViolations().add(new ErrorResponse.FieldViolation(fe.getField(), fe.getDefaultMessage()));
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(err);
    }

    // Bean Validation on @PathVariable/@RequestParam (rare here)
    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ErrorResponse> handleConstraint(ConstraintViolationException ex,
                                                          HttpServletRequest req) {
        ErrorResponse err = base(req, HttpStatus.BAD_REQUEST, "Validation failed");
        ex.getConstraintViolations().forEach(v ->
            err.getViolations().add(new ErrorResponse.FieldViolation(
                v.getPropertyPath().toString(), v.getMessage())));
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(err);
    }

    // 404 – Option not found
    @ExceptionHandler(OptionNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(OptionNotFoundException ex, HttpServletRequest req) {
        ErrorResponse err = base(req, HttpStatus.NOT_FOUND, ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(err);
    }

    // 409 – Business rule conflicts (locked poll, invalid delta)
    @ExceptionHandler(value = {VotingLockedException.class, InvalidVoteDeltaException.class})
    public ResponseEntity<ErrorResponse> handleConflict(RuntimeException ex, HttpServletRequest req) {
        ErrorResponse err = base(req, HttpStatus.CONFLICT, ex.getMessage());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(err);
    }

    // Fallback (optional): sanitize unexpected errors
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneric(Exception ex, HttpServletRequest req) {
        ErrorResponse err = base(req, HttpStatus.INTERNAL_SERVER_ERROR, "Unexpected error");
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(err);
    }
}
