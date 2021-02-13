package com.odde.doughnut;

import org.springframework.boot.autoconfigure.flyway.FlywayMigrationStrategy;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;

@Configuration
@Profile({"dev", "test"})
@Order(200)
public class NonProductConfiguration extends WebSecurityConfigurerAdapter {

    @Override
    protected void configure(AuthenticationManagerBuilder auth) throws Exception {
        PasswordEncoder encoder =
                PasswordEncoderFactories.createDelegatingPasswordEncoder();
        auth
                .inMemoryAuthentication()
                .withUser("user")
                .password(encoder.encode("password"))
                .roles("USER")
                .and()
                .withUser("admin")
                .password(encoder.encode("admin"))
                .roles("USER", "ADMIN");
    }

    @Override
    public void configure(HttpSecurity http) throws Exception {
        http
                .authorizeRequests()
                .anyRequest().authenticated()
                .and()
                .formLogin()
                .and()
                .httpBasic();

//        http.authorizeRequests(
//                a
//                        -> {
//                    try {
//                        a.antMatchers("/", "/login", "/error", "/webjars/**")
//                        .permitAll()
//                        .anyRequest()
//                        .authenticated()
//        .and().formLogin().and().httpBasic();
//                    } catch (Exception e) {
//                        e.printStackTrace();
//                    }
//                })
//                .formLogin()
//                .and()
//                .exceptionHandling(
//                        e
//                                -> e.authenticationEntryPoint(
//                                new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED)))
//                .httpBasic();
    }

}
