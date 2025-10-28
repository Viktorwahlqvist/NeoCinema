import React, { useEffect, useState } from "react";
import AllMoviesList, { ScreeningsInfo } from "../components/AllMoviesList";
import useFetch from "../hook/useFetch";
import FilterDropdown from "../components/filter/FilterDropdown";
import "./PagesStyle/allmoviesPages.scss";
import FilterBtn from "../components/filter/FilterBtn";
import { Col, Container, Row } from "react-bootstrap";
import { formatDate, getLimitedSortedDates } from "../utils/date";

interface SelectedFilter {
  date: string | null;
  auditorium: string | null;
  age: string | boolean;
}

export default function AllMoviesPage() {
  const [filteredData, setFilteredData] = useState<ScreeningsInfo[] | null>(
    null
  );
  const [filterOptions, setFilterOptions] = useState<SelectedFilter>({
    date: null,
    auditorium: null,
    age: false,
  });
  const { data, isLoading, error } =
    useFetch<ScreeningsInfo[]>("/api/screeningsInfo");

  // gets raw dates removes iso ater T
  const rawDates = data ? data.map((d) => d.startTime.split("T")[0]) : [];
  // sets a limit of 7 days and sort them.
  const limitedDays = getLimitedSortedDates(rawDates);
  // formating dates so we get weekday before
  const formattedDays = limitedDays.map((d) => formatDate(d));

  // sets formattedDays and iso dates to a object
  //  so we can use formated in label and iso in filtering
  const dateMap: Record<string, string> = {};
  limitedDays.forEach((d) => {
    dateMap[formatDate(d)] = d;
  });

  const handleOnClickDate = (date: string) => {
    setFilterOptions((prev) => ({ ...prev, date }));
  };
  const handleOnClickAuditorium = (auditorium: string) => {
    setFilterOptions((prev) => ({ ...prev, auditorium }));
  };
  const handleOnClickAge = () => {
    setFilterOptions((prev) => ({ ...prev, age: !prev.age }));
  };
  // useEffect if data or filterOptions change, (if data and auditorium is false show all)
  useEffect(() => {
    if (!data) return;

    const filtered = data.filter((screening) => {
      return (
        (!filterOptions.date ||
          screening.startTime.split("T")[0] === filterOptions.date) &&
        (!filterOptions.auditorium ||
          screening.auditoriumName === filterOptions.auditorium) &&
        (!filterOptions.age || Number(screening.info.ageLimit) < 18)
      );
    });

    setFilteredData(filtered);
  }, [data, filterOptions]);

  return (
    <Container>
      <main className="all-movies-container">
        <Row>
          <section className="text-container">
            <Col>
              <h1 className="all-movies-header">På bio just nu</h1>
            </Col>
            <Col>
              <p className="choose-text">
                Välj mellan våra två biografer och se vilka filmer som går
              </p>
            </Col>
          </section>
        </Row>
        <Row className="mx-5">
          <Col xs="auto">
            <FilterDropdown
              label="Välj ett datum"
              onClick={(label) => handleOnClickDate(dateMap[label])}
              options={formattedDays}
            />
          </Col>
          <Col xs="auto">
            <FilterDropdown
              label="Välj en salong"
              onClick={handleOnClickAuditorium}
              options={["Neo Lilla", "Neo Stora"]}
            />
          </Col>
          <Col xs="auto" className="d-flex align-items-end">
            <FilterBtn
              btnName={filterOptions.age ? ["Över 18"] : ["Under 18"]}
              onClick={handleOnClickAge}
            />
          </Col>
        </Row>
        {error && <p>Något gick fel: {error}</p>}
        {isLoading && <p>Loading...</p>}
        {data && <AllMoviesList movies={filteredData ?? data} />}
      </main>
    </Container>
  );
}
