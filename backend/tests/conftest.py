import os
import tempfile
from pathlib import Path

_test_db_fd, _test_db_raw = tempfile.mkstemp(suffix=".db")
os.close(_test_db_fd)
_test_db_path = Path(_test_db_raw).as_posix()
os.environ["DATABASE_URL"] = f"sqlite:///{_test_db_path}"
