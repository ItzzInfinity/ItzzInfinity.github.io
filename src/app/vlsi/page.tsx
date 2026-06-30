import DomainPage from "@/components/domain/DomainPage";

export default function VlsiPage() {
  return (
    <DomainPage
      domainId="vlsi"
      title="VLSI"
      subtitle="Semiconductor design, verification, and FPGA prototyping"
      subDomains={[
        { id: "rtl", label: "RTL Design" },
        { id: "verification", label: "Verification" },
        { id: "fpga", label: "FPGA Design" },
      ]}
    />
  );
}
