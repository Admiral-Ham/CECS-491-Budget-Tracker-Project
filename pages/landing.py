from pathlib import Path
from kivy.lang import Builder
from kivymd.uix.screen import MDScreen

from kivymd.uix.bottomnavigation import MDBottomNavigation, MDBottomNavigationItem
from kivy_garden.matplotlib.backend_kivyagg import FigureCanvasKivyAgg
import matplotlib.pyplot as plt
from kivymd.uix.boxlayout import MDBoxLayout
from kivymd.uix.button import MDRaisedButton
from kivymd.uix.scrollview import MDScrollView

Builder.load_file(str(Path(__file__).resolve().parents[1] / "ui" / "landing.kv"))

"""light_theme = ["white", "black", "Light"]
dark_theme = ["black", "white", "Dark"]
theme = dark_theme

data = [1250, 650, 375, 150, 75]
labels = ["Rent/House", "Loans & Debts", "Bills & Utilities", "Groceries", "Entertainment"]

def pie_chart():
    fig = plt.figure(facecolor=theme[0])
    ax = fig.add_subplot()
    ax.pie(data, startangle=90, wedgeprops=dict(width=0.3, edgecolor="w"))

    center = plt.Circle((0, 0), 0.7, fc=theme[0])
    plt.text(0, 0, f"Expenses\n -${sum(data)}", ha="center", va="center", fontsize=20, color=theme[1])
    plt.gca().add_artist(center)
    return fig"""

class LandingScreen(MDScreen):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        pass
        """self.theme_cls.theme_style = theme[2]
        
        bottom_nav = MDBottomNavigation()

        home_tab = MDBottomNavigationItem(name="home", text="Home", icon="home")
        home_layout = MDBoxLayout(orientation="vertical", padding="5dp")
        bar_layout = MDBoxLayout(orientation="vertical", adaptive_height=True, padding="5dp", spacing="2.5dp")
        scroll = MDScrollView()
        
        for each in labels:
            bar_layout.add_widget(
                MDRaisedButton(
                    text=f"{each}: -${data[labels.index(each)]}\n {int(data[labels.index(each)] / sum(data) * 100)}%",
                    halign="left", 
                    size_hint=(1, None), 
                    pos_hint={"center_x": 0.5}))
        
        home_layout.add_widget(FigureCanvasKivyAgg(pie_chart()))
        scroll.add_widget(bar_layout)
        home_layout.add_widget(scroll)
        home_tab.add_widget(home_layout)
        bottom_nav.add_widget(home_tab)
        
        budget_tab = MDBottomNavigationItem(name="budget", text="Budget", icon="currency-usd")
        bottom_nav.add_widget(budget_tab)
        
        calendar_tab = MDBottomNavigationItem(name="calendar", text="Calendar", icon="calendar")
        bottom_nav.add_widget(calendar_tab)
        
        self.add_widget(bottom_nav)
        """

    
