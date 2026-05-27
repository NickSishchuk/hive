package com.hive.common.config;
import lombok.*;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;
@Getter @Setter @Component
@ConfigurationProperties(prefix = "hive.jwt")
public class JwtProperties {
    private String secret;
    private long accessTokenExpirationMs;
    private int refreshTokenExpirationDays;
}
