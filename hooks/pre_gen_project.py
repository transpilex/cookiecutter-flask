import re

TERMINATOR = "\x1b[0m"
WARNING = "\x1b[1;33m [WARNING]: "
INFO = "\x1b[1;33m [INFO]: "
HINT = "\x1b[3;33m"
SUCCESS = "\x1b[1;32m [SUCCESS]: "

# The content of this string is evaluated by Jinja, and plays an important role.
# It updates the cookiecutter context to trim leading and trailing spaces

slug = "{{ cookiecutter.slug }}"
slug_regex = re.compile(r"^[a-z0-9-]+$")

if slug_regex.match(slug) is None:
    assert False, (
        f"'{slug}' is not a valid project slug. "
        "It must contain only lowercase letters, numbers or hyphens (-)."
    )
