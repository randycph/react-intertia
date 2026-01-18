import React from "react";
import { Head, usePage } from "@inertiajs/react";
import { PageProps } from "@/types";
import Layout from "../../Layouts";

interface SubjectGrade {
  subject: string;
  final_grade: number | null;
}

interface GradingPeriod {
  id: number;
  name: string;
}

interface SubjectGrade {
  subject: string;
  periods: Record<number, number | null>;
  final_grade: number | null;
}

interface ReportCardProps {
  student: {
    student_no: string;
    first_name: string;
    middle_name?: string;
    last_name: string;
  };
  schoolYear: {
    name: string;
  };
  section: {
    grade_level: number;
    name: string;
  };
  gradingPeriods: GradingPeriod[];
  subjects: SubjectGrade[];
}

const ReportCard = () => {
  const { student, schoolYear, section, subjects, gradingPeriods } =
    usePage<PageProps<ReportCardProps>>().props;

  return (
    <React.Fragment>
      <Head title="Report Card" />

      <div className="page-content">
        <div className="container-fluid">
          <div className="bg-white p-4 border">

            {/* HEADER */}
            <div className="mb-4 text-center">
              <div className="d-flex justify-content-end gap-2 mb-3 no-print">
                <button
                  className="btn btn-outline-secondary"
                  onClick={() => window.print()}
                >
                  <i className="ri-printer-line me-1" />
                  Print
                </button>

                <a
                  href={`/admin/students/${student.id}/report-card/pdf`}
                  className="btn btn-outline-danger"
                >
                  <i className="ri-file-pdf-line me-1" />
                  PDF
                </a>
              </div>

            </div>
            <div className="text-center mb-4">
              <h4 className="mb-1">REPORT CARD</h4>
              <div className="text-muted">
                School Year {schoolYear.name}
              </div>
            </div>

            {/* STUDENT INFO */}
            <table className="table table-sm mb-4">
              <tbody>
                <tr>
                  <td width="25%"><strong>Student Name</strong></td>
                  <td width="75%">
                    {student.last_name}, {student.first_name}{" "}
                    {student.middle_name ?? ""}
                  </td>
                </tr>
                <tr>
                  <td><strong>Student No</strong></td>
                  <td>{student.student_no}</td>
                </tr>
                <tr>
                  <td><strong>Grade & Section</strong></td>
                  <td>
                    Grade {section.grade_level} - {section.name}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* GRADES */}
            <table className="table table-bordered">
              <thead className="table-light">
                <tr>
                  <th>Subject</th>

                  {gradingPeriods.map((gp) => (
                    <th key={gp.id} className="text-center">
                      {gp.name}
                    </th>
                  ))}

                  <th width="180" className="text-center">
                    Final Grade
                  </th>
                </tr>
              </thead>

              <tbody>
                {subjects.map((s, index) => (
                  <tr key={index}>
                    <td>{s.subject}</td>

                    {gradingPeriods.map((gp) => (
                      <td key={gp.id} className="text-center">
                        {s.periods[gp.id] !== null && s.periods[gp.id] !== undefined
                          ? `${s.periods[gp.id]}%`
                          : "—"}
                      </td>
                    ))}

                    <td className="text-center">
                      {s.final_grade !== null ? `${s.final_grade}%` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>


            {/* FOOTER */}
            <div className="mt-5 d-flex justify-content-between">
              <div>
                <small>Prepared by:</small>
                <div className="border-top mt-4">
                  <small>Class Adviser</small>
                </div>
              </div>
              <div className="text-end">
                <small>Date Issued:</small>
                <div>{new Date().toLocaleDateString()}</div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

ReportCard.layout = (page: any) => <Layout children={page} />;
export default ReportCard;
