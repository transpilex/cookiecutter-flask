# Cookiecutter Flask


## Features

- For Python >=3.11
- Flask 3.1.2

## Usage

First, get Cookiecutter:

    uv tool install "cookiecutter>=1.7.0"

Now run it against this repo:

    uvx cookiecutter https://github.com/transpilex/cookiecutter-flask.git

You'll be prompted for some values. Provide them, then a project will be created for you.

Answer the prompts with your own desired [options] For example:

    Cloning into 'cookiecutter-flask'...
    remote: Counting objects: 550, done.
    remote: Compressing objects: 100% (310/310), done.
    remote: Total 550 (delta 283), reused 479 (delta 222)
    Receiving objects: 100% (550/550), 127.66 KiB | 58 KiB/s, done.
    Resolving deltas: 100% (283/283), done.
    name [My Awesome Project]: Reddit Clone
    slug [reddit_clone]: reddit
    description []: A reddit clone.
    version [1.0.0]: 0.0.1
    Select ui_library:
    1 - None
    2 - Bootstrap
    3 - Tailwind
    Choose from 1, 2, 3 [1]: 1
    Select frontend_pipeline:
    1 - None
    2 - Gulp
    3 - Vite
    Choose from 1, 2, 3 [1]: 1
    has_plugins_config [n]: n
