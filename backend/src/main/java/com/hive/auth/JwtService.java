package com.hive.auth;
import com.hive.common.config.JwtProperties;
import com.hive.user.User;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.*;
@Service @RequiredArgsConstructor
public class JwtService {
    private final JwtProperties jwtProperties;
    public String generateAccessToken(User user) {
        Date now = new Date();
        return Jwts.builder().subject(user.getId().toString())
                .claim("email", user.getEmail()).claim("name", user.getName())
                .issuedAt(now).expiration(new Date(now.getTime() + jwtProperties.getAccessTokenExpirationMs()))
                .signWith(getSigningKey()).compact();
    }
    public String generateRefreshToken() { return UUID.randomUUID().toString(); }
    public UUID extractUserId(String token) { return UUID.fromString(getClaims(token).getSubject()); }
    public boolean isValid(String token) {
        try { getClaims(token); return true; } catch (JwtException | IllegalArgumentException e) { return false; }
    }
    private Claims getClaims(String token) {
        return Jwts.parser().verifyWith(getSigningKey()).build().parseSignedClaims(token).getPayload();
    }
    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(jwtProperties.getSecret().getBytes(StandardCharsets.UTF_8));
    }
}
