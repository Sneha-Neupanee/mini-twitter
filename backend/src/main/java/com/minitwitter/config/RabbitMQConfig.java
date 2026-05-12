package com.minitwitter.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    @Value("${rabbitmq.exchanges.social}")
    private String socialExchange;

    @Value("${rabbitmq.queues.post-created}")
    private String postCreatedQueue;

    @Value("${rabbitmq.queues.post-liked}")
    private String postLikedQueue;

    @Value("${rabbitmq.queues.comment-added}")
    private String commentAddedQueue;

    @Value("${rabbitmq.queues.user-followed}")
    private String userFollowedQueue;

    @Value("${rabbitmq.routing-keys.post-created}")
    private String postCreatedRoutingKey;

    @Value("${rabbitmq.routing-keys.post-liked}")
    private String postLikedRoutingKey;

    @Value("${rabbitmq.routing-keys.comment-added}")
    private String commentAddedRoutingKey;

    @Value("${rabbitmq.routing-keys.user-followed}")
    private String userFollowedRoutingKey;

    @Bean
    public TopicExchange socialExchange() {
        return new TopicExchange(socialExchange);
    }

    @Bean
    public Queue postCreatedQueue() {
        return QueueBuilder.durable(postCreatedQueue).build();
    }

    @Bean
    public Queue postLikedQueue() {
        return QueueBuilder.durable(postLikedQueue).build();
    }

    @Bean
    public Queue commentAddedQueue() {
        return QueueBuilder.durable(commentAddedQueue).build();
    }

    @Bean
    public Queue userFollowedQueue() {
        return QueueBuilder.durable(userFollowedQueue).build();
    }

    @Bean
    public Binding postCreatedBinding() {
        return BindingBuilder.bind(postCreatedQueue()).to(socialExchange()).with(postCreatedRoutingKey);
    }

    @Bean
    public Binding postLikedBinding() {
        return BindingBuilder.bind(postLikedQueue()).to(socialExchange()).with(postLikedRoutingKey);
    }

    @Bean
    public Binding commentAddedBinding() {
        return BindingBuilder.bind(commentAddedQueue()).to(socialExchange()).with(commentAddedRoutingKey);
    }

    @Bean
    public Binding userFollowedBinding() {
        return BindingBuilder.bind(userFollowedQueue()).to(socialExchange()).with(userFollowedRoutingKey);
    }

    @Bean
    public MessageConverter jacksonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate rabbitTemplate = new RabbitTemplate(connectionFactory);
        rabbitTemplate.setMessageConverter(jacksonMessageConverter());
        return rabbitTemplate;
    }
}
