from pathlib import Path
from kivy.lang import Builder
from kivymd.uix.screen import MDScreen

Builder.load_file(str(Path(__file__).resolve().parents[1] / "ui" / "landing.kv"))

class LandingScreen(MDScreen):
    pass