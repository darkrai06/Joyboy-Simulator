from fastapi import FastAPI

app = FastAPI()

@app.get("/")
async def read_root():
    return {"message": "Welcome to Joyboy Simulator Backend"}

@app.get("/api/status")
async def get_status():
    return {"status": "running", "version": "1.0.0"}