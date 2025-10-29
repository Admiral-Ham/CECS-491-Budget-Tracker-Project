import matplotlib.pyplot as plt
import numpy as np



def hover(event):
    global selected
    if selected is not None:
        selected.set_center((0, 0))
        selected = None

    if event.inaxes is None or (event.xdata is None and event.ydata is None):
        if annotation.get_visible():
            annotation.set_visible(False)
            fig.canvas.draw_idle()

    index = None
    for i, w in enumerate(wedges):
        contains, _ = w.contains(event)
        if contains:
            index = i
            break

    changed = False
    if index is not None:
        w = wedges[index]
        annotation.set_text(f"{labels[index]}: -${vals[index]}")
        annotation.xy = (event.xdata, event.ydata)
        annotation.set_visible(True)
        theta = (w.theta2 + w.theta1) / 2
        w.set_center((0.2 * np.cos(np.deg2rad(theta)),
                      0.2 * np.sin(np.deg2rad(theta))))
        selected = w
        changed = True
    elif annotation.get_visible():
            annotation.set_visible(False)
            changed = True

    if changed:
        fig.canvas.draw_idle()
selected = None

fig, ax = plt.subplots()
vals = [-1250, -650, -375, -150, -75]
vals = list(map(lambda x: abs(x), vals))
labels = ["Rent", "Loans", "Bills", "Groceries", "Entertainment"]
colors = ["#FF0000", "#0000FF", "#008000", "#4B0082", "#EE82EE", "#FFA500", "#FFFF00"]

annotation = ax.annotate("", xy = (0, 0), xytext = (10, 10), textcoords = "offset points",
                         color = "black", bbox = dict(boxstyle = "square", fc = "white", ec = "black", lw = 1))
annotation.set_visible(False)

wedges, _ = ax.pie(vals, colors = colors,
          startangle = 90, textprops = dict(color = "w"), wedgeprops = dict(width = 0.3, edgecolor = "w"))

center = plt.Circle((0, 0), 0.7, fc = "white")
plt.gca().add_artist(center)
plt.text(0, 0, f"Expenses\n-${sum(vals)}", ha = "center", va = "center", fontsize = 12, color = "black")

plt.axis("equal") 
fig.canvas.mpl_connect("motion_notify_event", hover)
plt.show()
