
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Step1Company } from "./steps/Step1Company";
import { Step2LegalDocs } from "./steps/Step2LegalDocs";
import { Step3Financial } from "./steps/Step3Financial";
import { Step4References } from "./steps/Step4References";
import { Step5Declarations } from "./steps/Step5Declarations";
import { Step6Guarantee } from "./steps/Step6Guarantee";
import { Step7Submit } from "./steps/Step7Submit";
import { TypeformShell } from "@/components/layout/TypeformShell";
import { api, ApiError } from "@/lib/api-client";
import { toast } from "sonner";
import { AUTH_CODE } from "@/constants/auth";

export interface ApplicationData {
  step1?: any;
  step2?: any;
  step3?: any;
  step4?: any;
  step5?: any;
  step6?: any;
}

export function ApplicationForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [applicationData, setApplicationData] = useState<ApplicationData>({});
  const [applicationId, setApplicationId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadExistingApplication();
  }, []);

  const loadExistingApplication = async () => {
    try {
      const data = await api.get("/solicitud/current");
      if (data) {
        setApplicationId(data.id);
        setCurrentStep(data.current_step || 1);
        setApplicationData({
          step1: data.step1_data,
          step2: data.step2_data,
          step3: data.step3_data,
          step4: data.step4_data,
          step5: data.step5_data,
          step6: data.step6_data,
        });
      }
    } catch (error) {
      if (error instanceof ApiError && (error.errorCode === AUTH_CODE.TOKEN_MISSING || error.status === 401)) {
        return;
      }
      toast.error("Error al cargar la información del formulario");
    } finally {
      setIsLoading(false);
    }
  };

  const saveStep = async (stepNumber: number, stepData: any) => {
    if (!applicationId) return;
    try {
      await api.post("/solicitud/save-step", {
        application_id: applicationId,
        step_number: stepNumber,
        step_data: stepData,
      });
    } catch (error) {
      if (error instanceof ApiError && (error.errorCode === AUTH_CODE.TOKEN_MISSING || error.status === 401)) {
        return;
      }
      toast.error("Error al guardar el progreso");
    }
  };

  const handleStepComplete = async (stepNumber: number, data: any) => {
    const updatedData = {
      ...applicationData,
      [`step${stepNumber}`]: data,
    };
    setApplicationData(updatedData);
    await saveStep(stepNumber, data);
    
    if (stepNumber < 7) {
      setCurrentStep(stepNumber + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const stepNames = [
    "Información de Empresa",
    "Documentación Legal",
    "Información Financiera",
    "Referencias Comerciales",
    "Declaraciones y Aceptación",
    "Garantía Mobiliaria",
    "Revisión y Envío",
  ];

  return (
    <TypeformShell 
      currentStep={currentStep} 
      totalSteps={7} 
      stepName={stepNames[currentStep - 1]}
    >
      <AnimatePresence mode="wait">
        {currentStep === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Step1Company
              initialData={applicationData.step1}
              onComplete={(data) => handleStepComplete(1, data)}
            />
          </motion.div>
        )}

        {currentStep === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Step2LegalDocs
              initialData={applicationData.step2}
              applicationId={applicationId}
              onComplete={(data) => handleStepComplete(2, data)}
              onBack={handleBack}
            />
          </motion.div>
        )}

        {currentStep === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Step3Financial
              initialData={applicationData.step3}
              applicationId={applicationId}
              onComplete={(data) => handleStepComplete(3, data)}
              onBack={handleBack}
            />
          </motion.div>
        )}

        {currentStep === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Step4References
              initialData={applicationData.step4}
              onComplete={(data) => handleStepComplete(4, data)}
              onBack={handleBack}
            />
          </motion.div>
        )}

        {currentStep === 5 && (
          <motion.div
            key="step5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Step5Declarations
              initialData={applicationData.step5}
              onComplete={(data) => handleStepComplete(5, data)}
              onBack={handleBack}
            />
          </motion.div>
        )}

        {currentStep === 6 && (
          <motion.div
            key="step6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Step6Guarantee
              initialData={applicationData.step6}
              onComplete={(data) => handleStepComplete(6, data)}
              onBack={handleBack}
            />
          </motion.div>
        )}

        {currentStep === 7 && (
          <motion.div
            key="step7"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Step7Submit
              applicationData={applicationData}
              applicationId={applicationId}
              onBack={handleBack}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </TypeformShell>
  );
}
