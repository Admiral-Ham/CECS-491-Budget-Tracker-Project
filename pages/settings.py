from pathlib import Path
from kivy.lang import Builder
from kivymd.uix.screen import MDScreen

Builder.load_file(str(Path(__file__).resolve().parents[1] / "ui" / "settings.kv"))

class SettingsScreen(MDScreen):
    pass
    #TODO: All of the functionality of the buttons left here i think xd