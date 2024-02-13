"""Views, one for each Insta485 page."""
from insta485.views.index import show_index
from insta485.views.user import show_user
from insta485.views.upload import download_file
from insta485.views.create import show_create
from insta485.views.delete import show_delete
from insta485.views.password import show_password
from insta485.views.edit import show_edit
from insta485.views.auth import show_auth
from insta485.views.login import show_login
from insta485.views.posts import posts
from insta485.views.followers import followers
from insta485.views.following import show_following
from insta485.views.explore import explore
