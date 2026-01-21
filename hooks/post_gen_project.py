import json
import shutil
from pathlib import Path

TERMINATOR = "\x1b[0m"
WARNING = "\033[38;5;178m"
INFO = "\033[38;5;39m "
HINT = "\x1b[3;33m"
SUCCESS = "\033[38;5;35m"

def configure_layout_files(ui_library):
    bs_files = [
        "apps/templates/layouts/horizontal.html",
        "apps/templates/layouts/vertical.html",
    ]
    tw_files = [
        "apps/templates/layouts/horizontal-tw.html",
        "apps/templates/layouts/vertical-tw.html",
    ]

    if ui_library == "Tailwind":
        for file in bs_files:
            p = Path(file)
            if p.exists():
                p.unlink()

        for file in tw_files:
            p = Path(file)
            if p.exists():
                new_name = p.with_name(p.name.replace("-tw", ""))
                p.rename(new_name)

    elif ui_library == "Bootstrap":
        for file in tw_files:
            p = Path(file)
            if p.exists():
                p.unlink()

def remove_auth_files():
    folders = [
        "apps/templates/accounts",
        "apps/authentication",
    ]

    for folder in folders:
        p = Path(folder)
        if p.exists():
            shutil.rmtree(p)

def remove_gulp_files():
    file_names = ["gulpfile.js"]
    for file_name in file_names:
        Path(file_name).unlink()


def remove_packagejson_file():
    file_names = ["package.json"]
    for file_name in file_names:
        Path(file_name).unlink()


def update_package_json(remove_dev_deps=None, remove_keys=None, scripts=None):
    remove_dev_deps = remove_dev_deps or []
    remove_keys = remove_keys or []
    scripts = scripts or {}
    package_json = Path("package.json")
    content = json.loads(package_json.read_text())
    for package_name in remove_dev_deps:
        content["devDependencies"].pop(package_name)
    for key in remove_keys:
        content.pop(key)
    content["scripts"].update(scripts)
    updated_content = json.dumps(content, ensure_ascii=False, indent=2) + "\n"
    package_json.write_text(updated_content)


def handle_js_runner(frontend_pipeline, ui_library):
    if frontend_pipeline == "Gulp":
        if ui_library == "Tailwind":
            scripts = {"dev": "gulp", "build": "gulp build"}
            remove_dev_deps = [
                "sass",
                "gulp-sass",
                "gulp-uglify-es",
                "node-sass-tilde-importer"
            ]
        else:
            scripts = {"dev": "gulp", "build": "gulp build"}
            remove_dev_deps = ["@tailwindcss/postcss"]
        update_package_json(remove_dev_deps=remove_dev_deps, scripts=scripts)


def main():
    if "{{ cookiecutter.frontend_pipeline }}" in ["None"]:
        remove_gulp_files()
        remove_packagejson_file()
    else:
        handle_js_runner(
            "{{ cookiecutter.frontend_pipeline }}", "{{ cookiecutter.ui_library }}"
        )

    if "{{ cookiecutter.ui_library }}" != "None":
        configure_layout_files("{{ cookiecutter.ui_library }}")

    if "{{ cookiecutter.use_auth }}".lower() == "n":
        remove_auth_files()

    print(SUCCESS + "Project initialized, keep up the good work!" + TERMINATOR)


if __name__ == "__main__":
    main()
