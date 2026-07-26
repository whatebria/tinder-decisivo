"""Servicios de dominio para Servel.

Esta capa contiene la logica de negocio pura, desacoplada del transporte
HTTP (views). Es el candidato natural para tests unitarios directos y
para reuso desde comandos CLI, tareas Celery, o cualquier otro entrypoint.
"""
