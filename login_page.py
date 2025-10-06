from kivy.app import App
from kivy.lang import Builder
from kivy.uix.boxlayout import BoxLayout
from kivy.uix.label import Label
from kivy.uix.textinput import TextInput
from kivy.uix.button import Button
from kivymd.app import MDApp

class MyApp(MDApp):
    def build(self):
        self.title = "Login demo for budgeting app"
        self.theme_cls.primary_palette = "Teal"
        self.theme_cls.theme_style = "Dark"
        return Builder.load_file("login.kv")
    
    def check_login(self, username, password):
        if not username or not password:
            self.root.ids.status.text = "Enter username or password"
            return
        
        if username == "TechnicSolutions" and password == "1234":
            self.root.ids.status.text = "Login Successfull"
        else:
            self.root.ids.status.text = "Login Failed"
            #this clears the password after failed attempt
            self.root.ids.password.text = ""
            self._color_status(error=True)
            
    def _color_status(self, error):
        lbl = self.root.ids.status
        lbl.theme_text_color = "Custom"
        lbl.text_color = (0.86,0.16,0.16,1) if error else (0.13, 0.59, 0.35,1)


if __name__ == "__main__":
    MyApp().run()