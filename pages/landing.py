from kivymd.uix.screen import MDScreen
from kivy.lang import Builder

class LandingScreen(MDScreen):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        Builder.load_file("ui/login.kv")