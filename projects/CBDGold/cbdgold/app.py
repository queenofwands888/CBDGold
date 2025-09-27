import gradio as gr

def greet(name):
    return f"Hello, {name}! Welcome to CBDGold."

iface = gr.Interface(
    fn=greet,
    inputs=gr.Textbox(label="Your Name"),
    outputs=gr.Textbox(label="Greeting"),
    title="CBDGold Hugging Face Demo",
    description="This is a minimal demonstration backend for the CBDGold Hugging Face Space."
)

if __name__ == "__main__":
    iface.launch()
