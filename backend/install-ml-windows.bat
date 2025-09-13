@echo off
echo 🚀 Installing ML dependencies for Team Rocket Backend (Windows)
echo.
echo This will install numpy, pandas, scikit-learn, lightgbm using conda/pip
echo.

REM Check if conda is available
conda --version >NUL 2>&1
if %errorlevel% NEQ 0 (
    echo ❌ Conda not found. Installing with pip instead...
    echo.
    python -m pip install --user numpy==1.24.3 pandas==2.1.4 scikit-learn==1.3.2 lightgbm==4.1.0 joblib==1.3.2
    if %errorlevel% NEQ 0 (
        echo.
        echo ❌ Pip installation failed. Trying with --force-reinstall...
        python -m pip install --user --force-reinstall numpy pandas scikit-learn lightgbm joblib
    )
) else (
    echo ✅ Conda found! Using conda for faster installation...
    conda install -y numpy pandas scikit-learn lightgbm joblib -c conda-forge
)

echo.
echo ✅ Testing ML imports...
python -c "import numpy, pandas, sklearn, lightgbm, joblib; print('✅ All ML packages imported successfully!')"

if %errorlevel% EQU 0 (
    echo.
    echo 🎉 ML dependencies installed successfully!
    echo Now you can run: python main.py
) else (
    echo.
    echo ❌ Some packages failed to install. The backend will use fallback mode.
)

pause