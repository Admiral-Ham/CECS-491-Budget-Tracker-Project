from kivymd.uix.screen import MDScreen
from kivymd.uix.bottomnavigation import MDBottomNavigation, MDBottomNavigationItem
from kivy_garden.matplotlib.backend_kivyagg import FigureCanvasKivyAgg
import matplotlib.pyplot as plt
from kivymd.uix.boxlayout import MDBoxLayout
from kivymd.uix.button import MDRaisedButton, MDIconButton
from kivymd.uix.scrollview import MDScrollView
from kivymd.uix.pickers import MDDatePicker
from kivymd.uix.label import MDLabel
from datetime import datetime
from kivymd.uix.dialog import MDDialog
from kivymd.uix.textfield import MDTextField
from kivymd.uix.menu import MDDropdownMenu

light_theme = ["white", "black", "Light"]
dark_theme = ["black", "white", "Dark"]
theme = dark_theme

labels = ["Rent/House", "Loans & Debts", "Bills & Utilities", "Groceries", "Entertainment"]


class HomePageScreen(MDScreen):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.transactions_by_date = {datetime.now().strftime("%Y-%m-%d"): []}
        self.current_date = datetime.now().strftime("%Y-%m-%d")
        bottom_nav = MDBottomNavigation()
        self.add_widget(bottom_nav)

        home_tab = MDBottomNavigationItem(
            name="home",
            text="Home",
            icon="home",)
        self.home_layout = MDBoxLayout(
            orientation="vertical",
            padding="5dp",)
        
        self.pie_chart_container = MDBoxLayout(size_hint=(1, 0.5))
        self.home_layout.add_widget(self.pie_chart_container)

        self.home_scroll = MDScrollView(size_hint=(1, 0.5))
        self.bar_layout = MDBoxLayout(
            orientation="vertical",
            adaptive_height=True,
            padding="5dp",
            spacing="2.5dp",
        )
        self.home_scroll.add_widget(self.bar_layout)
        self.home_layout.add_widget(self.home_scroll)

        home_tab.add_widget(self.home_layout)
        bottom_nav.add_widget(home_tab)

        budget_tab = MDBottomNavigationItem(
            name="budget",
            text="Budget",
            icon="currency-usd",)
        bottom_nav.add_widget(budget_tab)



        calendar_tab = MDBottomNavigationItem(
            name="calendar",
            text="Calendar",
            icon="calendar",)

        calendar_layout = MDBoxLayout(
            orientation="vertical",
            padding="5dp",
            spacing="10dp",)
        self.date_label = MDLabel(
            text=f"Selected Date: {datetime.now().strftime('%B %d, %Y')}",
            halign="center",
            size_hint=(1, None),
            height="48dp",
            font_style="H6",)
        calendar_layout.add_widget(self.date_label)
        button_row = MDBoxLayout(
            orientation="horizontal",
            size_hint=(1, None),
            height="48dp",
            spacing="10dp",)
        date_picker_btn = MDRaisedButton(
            text="Change Date",
            size_hint=(0.5, 1),
            pos_hint={"center_x": 0.5},
            on_release=self.show_date_picker,)
        add_transaction_btn = MDRaisedButton(
            text="Add Transaction",
            size_hint=(0.5, 1),
            pos_hint={"center_x": 0.5},
            on_release=self.show_add_transaction_dialog,)
        button_row.add_widget(date_picker_btn)
        button_row.add_widget(add_transaction_btn)
        calendar_layout.add_widget(button_row)
        self.calendar_bar = MDBoxLayout(
            orientation="vertical",
            adaptive_height=True,
            padding="5dp",
            spacing="2.5dp",)
        calendar_scroll = MDScrollView()
        calendar_scroll.add_widget(self.calendar_bar)
        calendar_layout.add_widget(calendar_scroll)
        calendar_tab.add_widget(calendar_layout)
        bottom_nav.add_widget(calendar_tab)

        self.load_transactions_for_date()
        self.update_home_page()

    def calculate_category_totals(self):
        category_totals = {label: 0 for label in labels}
        for _, transactions in self.transactions_by_date.items():
            for transaction in transactions:
                category = transaction.get("category", "")
                amount = transaction.get("amount", 0)
                if category in category_totals:
                    category_totals[category] += amount
        return category_totals

    def pie_chart(self):
        category_totals = self.calculate_category_totals()
        data = [category_totals[label] for label in labels]
        total = sum(data)

        fig = plt.figure(facecolor=theme[0])
        ax = fig.add_subplot()

        if total > 0:
            ax.pie(
                data,
                startangle=90,
                wedgeprops=dict(width=0.3, edgecolor="w"),
            )
            center = plt.Circle((0, 0), 0.7, fc=theme[0])
            plt.text(0, 0, f"Expenses\n -${sum(data)}", ha="center", va="center", fontsize=20, color=theme[1],)
            plt.gca().add_artist(center)
        else:
            ax.pie([], startangle=90, wedgeprops=dict(width=0.3, edgecolor="w"))
        return fig

    def update_home_page(self):
        self.pie_chart_container.clear_widgets()
        self.bar_layout.clear_widgets()
        self.pie_chart_container.add_widget(FigureCanvasKivyAgg(self.pie_chart()))
        category_totals = self.calculate_category_totals()
        data = [category_totals[label] for label in labels]
        total = sum(data)

        if total > 0:
            for label in labels:
                amount = category_totals[label]
                if amount > 0:
                    percentage = int(amount / total * 100)
                    item_layout = MDBoxLayout(
                        orientation="horizontal",
                        size_hint=(1, None),
                        height="48dp",
                        spacing="10dp",)
                    left_label = MDLabel(
                        text=f"{label} ({percentage}%)",
                        halign="left",
                        size_hint=(0.75, 1),)
                    right_label = MDLabel(
                        text=f"-${amount: .2f}",
                        halign="right",
                        size_hint=(0.25, 1),)
                    item_layout.add_widget(left_label)
                    item_layout.add_widget(right_label)
                    button_wrapper = MDRaisedButton(
                        size_hint=(1, None),
                        height="48dp",
                        pos_hint={"center_x": 0.5},)
                    button_wrapper.add_widget(item_layout)
                    self.bar_layout.add_widget(button_wrapper)
        else:
            no_expenses_label = MDLabel(
                text="No expenses yet\nAdd transactions using the Calendar tab",
                halign="center",
                size_hint=(1, None),
                height="48dp",)
            self.bar_layout.add_widget(no_expenses_label)

    def load_transactions_for_date(self):
        self.calendar_bar.clear_widgets()
        transactions = self.transactions_by_date.get(self.current_date, [])

        if not transactions:
            no_transactions_label = MDLabel(
                text="No transactions for this date",
                halign="center",
                size_hint=(1, None),
                height="48dp",)
            self.calendar_bar.add_widget(no_transactions_label)
        else:
            for transaction in transactions:
                display_text = (f"{transaction['category']}: "f"${transaction['amount']} - {transaction['description']}")
                transaction_layout = MDBoxLayout(
                    orientation="horizontal",
                    size_hint=(1, None),
                    height="48dp",
                    spacing="10dp",)
                transaction_button = MDRaisedButton(
                    text=display_text,
                    size_hint=(0.8, 1),
                    pos_hint={"center_y": 0.5},)
                edit_btn = MDIconButton(
                    icon="pencil",
                    size_hint=(0.1, 1),
                    pos_hint={"center_y": 0.5},
                    on_release=lambda x, t=transaction: self.show_edit_transaction_dialog(t),)
                delete_btn = MDIconButton(
                    icon="delete",
                    size_hint=(0.1, 1),
                    pos_hint={"center_y": 0.5},
                    on_release=lambda x, t=transaction: self.remove_transaction(t),)
                transaction_layout.add_widget(transaction_button)
                transaction_layout.add_widget(edit_btn)
                transaction_layout.add_widget(delete_btn)
                self.calendar_bar.add_widget(transaction_layout)

    def remove_transaction(self, transaction):
        if self.current_date in self.transactions_by_date:
            if transaction in self.transactions_by_date[self.current_date]:
                self.transactions_by_date[self.current_date].remove(transaction)
                if not self.transactions_by_date[self.current_date]:
                    del self.transactions_by_date[self.current_date]
                self.load_transactions_for_date()
                self.update_home_page()

    def show_edit_transaction_dialog(self, transaction):
        existing_category = transaction.get("category", "")
        existing_amount = str(transaction.get("amount", ""))
        existing_desc = transaction.get("description", "")
        self.editing_transaction = transaction
        self.selected_category = existing_category
        self.edit_category_button = MDRaisedButton(
            text=existing_category if existing_category else "Select Category",
            size_hint_y=None,
            height="48dp",
            on_release=self.open_edit_category_menu,)
        menu_items = []
        for label in labels:
            menu_items.append(
                {
                    "viewclass": "OneLineListItem",
                    "text": label,
                    "on_release": lambda x=label: self.set_edit_category(x),
                }
            )
        self.edit_category_menu = MDDropdownMenu(
            caller=self.edit_category_button,
            items=menu_items,
            width_mult=4,)
        self.edit_amount_field = MDTextField(
            hint_text="Enter amount",
            input_filter="float",
            text=existing_amount,)
        self.edit_transaction_text_field = MDTextField(
            hint_text="Enter transaction description",
            text=existing_desc,)
        content_box = MDBoxLayout(
            orientation="vertical",
            spacing="12dp",
            size_hint_y=None,
            height="180dp",)
        content_box.add_widget(self.edit_category_button)
        content_box.add_widget(self.edit_amount_field)
        content_box.add_widget(self.edit_transaction_text_field)
        self.edit_dialog = MDDialog(
            title="Edit Transaction",
            type="custom",
            content_cls=content_box,
            buttons=[
                MDRaisedButton(
                    text="CANCEL",
                    on_release=lambda x: self.edit_dialog.dismiss(),),
                MDRaisedButton(
                    text="SAVE",
                    on_release=self.save_edited_transaction,),],)
        self.edit_dialog.open()

    def open_edit_category_menu(self, *args):
        if hasattr(self, "edit_category_menu"):
            self.edit_category_menu.open()

    def set_edit_category(self, category_text):
        self.selected_category = category_text
        self.edit_category_button.text = category_text
        if hasattr(self, "edit_category_menu"):
            self.edit_category_menu.dismiss()

    def save_edited_transaction(self, *args):
        desc = (
            self.edit_transaction_text_field.text.strip()
            if hasattr(self, "edit_transaction_text_field")
            else "")
        amt = (
            self.edit_amount_field.text.strip()
            if hasattr(self, "edit_amount_field")
            else "")
        cat = self.selected_category if hasattr(self, "selected_category") else ""
        if cat and amt and hasattr(self, "editing_transaction"):
            try:
                amount_float = float(amt)
                new_transaction = {
                    "category": cat,
                    "amount": amount_float,
                    "description": desc,
                    "date": self.current_date,}
                if self.current_date in self.transactions_by_date:
                    try:
                        index = self.transactions_by_date[self.current_date].index(self.editing_transaction)
                        self.transactions_by_date[self.current_date][index] = (new_transaction)
                        self.load_transactions_for_date()
                        self.update_home_page()
                    except ValueError:
                        pass
            except ValueError:
                pass
        if hasattr(self, "edit_dialog"):
            self.edit_dialog.dismiss()

    def show_add_transaction_dialog(self, *args):
        self.selected_category = ""
        self.category_button = MDRaisedButton(
            text="Select Category",
            size_hint_y=None,
            height="48dp",
            on_release=self.open_category_menu,)
        menu_items = []
        for label in labels:
            menu_items.append({
                    "viewclass": "OneLineListItem",
                    "text": label,
                    "on_release": lambda x=label: self.set_category(x),
                })
        self.category_menu = MDDropdownMenu(
            caller=self.category_button,
            items=menu_items,
            width_mult=4,)
        self.amount_field = MDTextField(
            hint_text="Enter amount",
            input_filter="float",)
        self.transaction_text_field = MDTextField(
            hint_text="Enter transaction description",)
        content_box = MDBoxLayout(
            orientation="vertical",
            spacing="12dp",
            size_hint_y=None,
            height="180dp",)
        content_box.add_widget(self.category_button)
        content_box.add_widget(self.amount_field)
        content_box.add_widget(self.transaction_text_field)
        self.add_dialog = MDDialog(
            title="Add New Transaction",
            type="custom",
            content_cls=content_box,
            buttons=[
                MDRaisedButton(
                    text="CANCEL",
                    on_release=lambda x: self.add_dialog.dismiss(),),
                MDRaisedButton(
                    text="ADD",
                    on_release=self.add_transaction,),],)
        self.add_dialog.open()

    def open_category_menu(self, *args):
        if hasattr(self, "category_menu"):
            self.category_menu.open()

    def set_category(self, category_text):
        self.selected_category = category_text
        self.category_button.text = category_text
        if hasattr(self, "category_menu"):
            self.category_menu.dismiss()

    def add_transaction(self, *args):
        desc = (
            self.transaction_text_field.text.strip()
            if hasattr(self, "transaction_text_field")
            else ""
        )
        amt = self.amount_field.text.strip() if hasattr(self, "amount_field") else ""
        cat = self.selected_category if hasattr(self, "selected_category") else ""

        if cat and amt:
            try:
                amount_float = float(amt)
                transaction = {
                    "category": cat,
                    "amount": amount_float,
                    "description": desc,
                    "date": self.current_date,
                }
                if self.current_date not in self.transactions_by_date:
                    self.transactions_by_date[self.current_date] = []
                self.transactions_by_date[self.current_date].append(transaction)
                self.load_transactions_for_date()
                self.update_home_page()
            except ValueError:
                pass

        if hasattr(self, "add_dialog"):
            self.add_dialog.dismiss()

    def on_save(self, instance, value, date_range):
        self.current_date = value.strftime("%Y-%m-%d")
        self.date_label.text = f"Selected Date: {value.strftime('%B %d, %Y')}"
        self.load_transactions_for_date()

    def show_date_picker(self, *args):
        date_dialog = MDDatePicker(
            primary_color=(0, 121, 107, 1),
            text_weekday_color=(0, 121, 107, 1),
        )
        date_dialog.bind(on_save=self.on_save)
        date_dialog.open()