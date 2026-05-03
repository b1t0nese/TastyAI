from flask import Blueprint, render_template, abort
import os


web_bp = Blueprint('web', __name__, template_folder=os.path.join(
    os.path.dirname(__file__), "templates"))


@web_bp.route('/', defaults={'filename': 'index.html'})
@web_bp.route('/<filename>')
def serve_html(filename):
    template_path = os.path.join(web_bp.template_folder, filename)
    print(template_path)
    if os.path.exists(template_path) and filename.endswith('.html'):
        return render_template(filename)
    else:
        abort(404)