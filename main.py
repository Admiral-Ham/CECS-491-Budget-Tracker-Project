from kivymd.app import MDApp
from kivy.uix.screenmanager import ScreenManager

from pages.login_page import LoginScreen
from pages.home_page import HomePageScreen


import webbrowser

import re
from kivymd.uix.dialog import MDDialog
from kivymd.uix.button import MDFlatButton
from kivymd.uix.textfield import MDTextField

class MyApp(MDApp):
    def build(self):
        self.title = "Budget Tracker"
        self.theme_cls.primary_palette = "Teal"
        self.theme_cls.theme_style = "Dark"
        self.forgot_dialog = None
        self.forgot_email_field = None

        sm = ScreenManager()
        sm.add_widget(LoginScreen(name="login"))
        sm.add_widget(HomePageScreen(name="home"))
        sm.current = "login"
        return sm

        
        

    def check_login(self, username, password):
        login = self.root.get_screen("login")
        
        if not username or not password:
            login.ids.status.text = "Enter username or password"
            return
# testing connection for login page
            """response = requests.post(
            "http://127.0.0.1:5000/login",
            json={"email": username,
                  "password": password
            }
        )

        try:
            response = requests.post(
                "http://127.0.0.1:5000/login",
                json={"username": username, "password": password}
            )
            data = response.json()

            if data["success"]:
                login.ids.status.text = data["message"]
                self.root.current = "landing"
            else:
                login.ids.status.text = "Login Failed"
                login.ids.password.text = ""

        except Exception as e:
            login.ids.status.text = "Server Error"
            print("Error:", e)"""

        if username == "test" and password == "test":
            login.ids.status.text = "Login Successfull"
            self.root.current = "home"
        else:
            login.ids.status.text = "Login Failed"
            login.ids.password.text = ""
            
    #These next two functions will probably be deleted but here for example sakes
    def show_forgot_password(self):
        if not self.forgot_dialog:
            self.forgot_email_field = MDTextField(
                hint_text="Enter your email",
                helper_text="Instructions for email reset sent or something",
                helper_text_mode="on_focus",
                size_hint_y=None,
                height="56dp",
                
            )
            
            self.forgot_dialog = MDDialog(
                title="Forgot password",
                type="custom",
                content_cls=self.forgot_email_field,
                buttons=[
                    MDFlatButton(
                        text="Cancel",
                        on_release=lambda *args: self.forgot_dialog.dismiss()
                    ),
                    MDFlatButton(
                        text="Send",
                        on_release=lambda *args: self.send_reset_email()
                    ),
                ],
            )
        self.forgot_email_field.text = ""
        self.forgot_dialog.open()
        
    def send_reset_email(self):
        email = (self.forgot_email_field.text or "").strip()
        login = self.root.get_screen("login")
        status = login.ids.status
        
        if not re.match(r"[^@]+@[^@]+\.[^@]+", email):
            status.text = "Please enter a valid email."
            return
        
        #Backend goes here but for now funny texxt xd
        status.text = "Work in Progress"
        self.forgot_dialog.dismiss()
            
    # --- Functions for Settings ---
    def open_learn_page(self):
        webbrowser.open("https://consumer.gov/your-money/making-budget")
    def open_privacy_page(self):
        pass
    def open_about_page(self):
        pass
    
    

if __name__ == "__main__":
    MyApp().run()

