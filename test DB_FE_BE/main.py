from kivymd.app import MDApp
from kivymd.uix.screen import MDScreen
from kivymd.uix.button import MDRaisedButton
from kivymd.uix.label import MDLabel
from kivy.uix.boxlayout import BoxLayout

import api_service


class TestScreen(MDScreen):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)

        layout = BoxLayout(orientation="vertical", padding=20, spacing=20)

        # Label for showing API response
        self.output_label = MDLabel(
            text="Press the button to test backend connection",
            halign="center"
        )

        # Button that calls Flask backend
        test_button = MDRaisedButton(
            text="Test Backend Connection",
            pos_hint={"center_x": 0.5},
            on_release=self.test_backend
        )

        layout.add_widget(self.output_label)
        layout.add_widget(test_button)

        self.add_widget(layout)

    # Button callback
    def test_backend(self, instance):
        result = api_service.test_connection()
        self.output_label.text = str(result)


class MyApp(MDApp):
    def build(self):
        return TestScreen()


if __name__ == "__main__":
    MyApp().run()
