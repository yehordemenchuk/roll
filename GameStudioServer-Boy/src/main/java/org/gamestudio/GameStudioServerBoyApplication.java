package org.gamestudio;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.EnableAspectJAutoProxy;

@EnableAspectJAutoProxy
@SpringBootApplication
public class GameStudioServerBoyApplication {

    public static void main(String[] args) {
        SpringApplication.run(GameStudioServerBoyApplication.class, args);
    }

}
