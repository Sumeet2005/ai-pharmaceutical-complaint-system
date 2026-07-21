import React from "react";
import { useForm } from "react-hook-form";
import PageContainer from "src/components/common/PageContainer";
import Card from "src/components/common/Card";
import Input from "src/components/common/Input";
import Button from "src/components/common/Button";

const Complaint = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = () => {
    // Architectural foundation: form validation and structure only
  };

  return (
    <PageContainer
      title="Complaint Intake"
      description="Register new pharmaceutical product complaints, adverse events, or quality issues."
    >
      <Card
        title="New Complaint Registration"
        subtitle="Ensure all regulatory details are provided accurately for compliance reporting."
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Product Name"
              placeholder="e.g. Amoxicillin 500mg"
              error={errors.productName}
              {...register("productName", { required: "Product name is required" })}
            />
            <Input
              label="Batch / Lot Number"
              placeholder="e.g. LOT12345"
              error={errors.batchNumber}
              {...register("batchNumber", { required: "Batch number is required" })}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Subject / Issue Title"
              placeholder="e.g. Package seal broken"
              error={errors.subject}
              {...register("subject", { required: "Subject is required" })}
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Severity Level</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                {...register("severity", { required: "Severity level is required" })}
              >
                <option value="">Select severity...</option>
                <option value="critical">Critical (e.g. health hazard)</option>
                <option value="major">Major (e.g. product defect)</option>
                <option value="minor">Minor (e.g. packaging issue)</option>
              </select>
              {errors.severity && (
                <span className="text-xs text-red-600 font-medium">
                  {errors.severity.message}
                </span>
              )}
            </div>
          </div>
          <Input
            label="Detailed Description"
            type="textarea"
            placeholder="Please describe the adverse event or product quality issue in detail..."
            error={errors.description}
            {...register("description", { required: "Description is required" })}
          />
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button type="button" variant="secondary">
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Register Complaint
            </Button>
          </div>
        </form>
      </Card>
    </PageContainer>
  );
};

export default Complaint;
