# pages/login_page.py
from pathlib import Path
from kivymd.uix.screen import MDScreen
from kivy.lang import Builder

class LoginScreen(MDScreen):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        kv_path = Path(__file__).resolve().parents[1] / "ui" / "login.kv"
        root = Builder.load_file(str(kv_path))  
        self.add_widget(root)                  
        self.ids.update(root.ids)              
