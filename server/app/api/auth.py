from fastapi import APIRouter, HTTPException, Depends
from server.app.core.supabase_client import supabase
from server.app.models.auth import RegisterRequest, LoginRequest, ForgotPasswordRequest
from server.app.utils.auth import verify_jwt

router = APIRouter()

@router.post("/register")
def register_user(data: RegisterRequest):
    # Use Supabase Auth to register user
    try:
        response = supabase.auth.sign_up({"email": data.email, "password": data.password})
        if response.user is None:
            raise HTTPException(status_code=400, detail=response.data.get("msg", "Registration failed."))
        return {"message": "Registration successful.", "user_id": response.user.id}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/login")
def login_user(data: LoginRequest):
    # Use Supabase Auth to sign in
    try:
        response = supabase.auth.sign_in_with_password({"email": data.email, "password": data.password})
        if response.user is None or response.session is None:
            raise HTTPException(status_code=401, detail="Invalid credentials.")
        return {
            "access_token": response.session.access_token,
            "refresh_token": response.session.refresh_token,
            "user_id": response.user.id
        }
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))

@router.post("/forgot-password")
def forgot_password(data: ForgotPasswordRequest):
    try:
        # Send a password reset email using Supabase Auth
        response = supabase.auth.reset_password_for_email(
            data.email,
            {"redirect_to": "https://your-frontend-domain.com/update-password"}  # Change to your frontend's reset page
        )
        if hasattr(response, 'error') and response.error:
            raise HTTPException(status_code=400, detail=str(response.error))
        return {"message": f"Password reset email sent to {data.email}. Please check your inbox."}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/protected")
def protected_route(user=Depends(verify_jwt)):
    return {"message": "You are authenticated!", "user": user}
