package org.gamestudio.aspect;

import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;

@Aspect
@Component
@Slf4j
public class LoggerAspect {
    @Around("execution(* org.gamestudio.service.*.*(..))")
    public Object log(ProceedingJoinPoint joinPoint) throws Throwable {
        log.info(joinPoint.getSignature().toShortString() + " starts execution");

        Instant start = Instant.now();

        Object proceedingRes = joinPoint.proceed();

        Instant end = Instant.now();

        long duration = Duration.between(start, end).toMillis();

        log.info("Execution time: " + duration + " ms");

        log.info(joinPoint.getSignature().toShortString() + " ends execution");

        return proceedingRes;
    }

    @Before("execution(* org.gamestudio.service.*.*(..))")
    public void log(JoinPoint joinPoint) throws Throwable {
        log.info(joinPoint.getSignature().toShortString() + " starts executing");
    }
}
