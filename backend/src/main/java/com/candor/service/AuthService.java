package com.candor.service;

import com.candor.dto.AuthResponseDto;
import com.candor.dto.LoginRequest;
import com.candor.dto.RegisterRequest;
import com.candor.entity.User;
import com.candor.exception.AuthException;
import com.candor.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public AuthResponseDto register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new AuthException("Username is already taken.", HttpStatus.CONFLICT);
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setCreatedAt(Instant.now());
        userRepository.save(user);

        String token = jwtService.generateToken(user.getUsername());
        return new AuthResponseDto(token, user.getUsername());
    }

    public AuthResponseDto login(LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new AuthException("Invalid username or password.", HttpStatus.UNAUTHORIZED));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new AuthException("Invalid username or password.", HttpStatus.UNAUTHORIZED);
        }

        String token = jwtService.generateToken(user.getUsername());
        return new AuthResponseDto(token, user.getUsername());
    }
}
