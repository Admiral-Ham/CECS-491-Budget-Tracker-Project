from kivymd.app import MDApp
from kivy.uix.screenmanager import ScreenManager

from pages.login_page import LoginScreen
from pages.landing import LandingScreen

class MyApp(MDApp):
    def build(self):
        self.title = "DEMO FOR BUDGET APP"
        self.theme_cls.primary_palette = "Teal"
        self.theme_cls.theme_style = "Dark"

        sm = ScreenManager()
        sm.add_widget(LoginScreen(name="login"))
        sm.add_widget(LandingScreen(name="landing"))
        sm.current = "login"
        return sm

    def check_login(self, username, password):
        login = self.root.get_screen("login")
        
        if not username or not password:
            login.ids.status.text = "Enter username or password"
            return

        if username == "TechnicSolutions" and password == "1234":
            login.ids.status.text = "Login Successfull"
            self.root.current = "landing"
        else:
            login.ids.status.text = "Login Failed"
            login.ids.password.text = ""  

if __name__ == "__main__":
    MyApp().run()
