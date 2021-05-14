import os
from dotenv import load_dotenv

load_dotenv()
# basedir = os.path.abspath(os.path.dirname(__file__))

DB_USERNAME = os.environ.get('DB_USERNAME')
DB_PASSWORD = os.environ.get('DB_PASSWORD')
DB_ENGINE = os.environ.get('DB_ENGINE')
DB_NAME = os.environ.get('DB_NAME')
DB_HOST = os.environ.get('DB_HOST')
DB_PORT = os.environ.get('DB_PORT')


class BaseConfig:
    """Base configuration"""
    ITEMS_PER_PAGE = 20
    SECRET_KEY = os.environ.get('SECRET_DEV_KEY')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    TESTING = False
    TOKEN_EXPIRATION_DAYS = 30
    TOKEN_EXPIRATION_SECONDS = 0
    ES_HOST = os.environ.get('ES_HOST')
    ES_PORT = os.environ.get('ES_PORT')
    ELASTICSEARCH_URL = os.environ.get('ELASTICSEARCH_URL')


class DevelopmentConfig(BaseConfig):
    """Development configuration"""
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_DEV_URL')
    # SQLALCHEMY_DATABASE_URI = 'sqlite:///' + os.path.join(basedir, 'app.db')


class TestingConfig(BaseConfig):
    """Testing configuration"""
    ITEMS_PER_PAGE = 2
    PRESERVE_CONTEXT_ON_EXCEPTION = False
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_TEST_URL')
    TESTING = True
    TOKEN_EXPIRATION_DAYS = 0
    TOKEN_EXPIRATION_SECONDS = 3


class ProductionConfig(BaseConfig):
    """Production configuration"""
    DEBUG = False
    SQLALCHEMY_DATABASE_URI = f'{DB_ENGINE}://{DB_USERNAME}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}'
    SECRET_KEY = os.environ.get('SECRET_KEY')
