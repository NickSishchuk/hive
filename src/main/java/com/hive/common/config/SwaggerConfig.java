package com.hive.common.config;
import io.swagger.v3.oas.models.*;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.*;
import org.springframework.context.annotation.*;
@Configuration
public class SwaggerConfig {
    private static final String SCHEME_NAME = "bearerAuth";
    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
                .info(new Info().title("Hive API").description("Virtual coworking platform").version("0.1.0"))
                .addSecurityItem(new SecurityRequirement().addList(SCHEME_NAME))
                .components(new Components().addSecuritySchemes(SCHEME_NAME,
                        new SecurityScheme().name(SCHEME_NAME).type(SecurityScheme.Type.HTTP)
                                .scheme("bearer").bearerFormat("JWT")));
    }
}
