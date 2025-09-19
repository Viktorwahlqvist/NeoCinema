import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';


export type CardholderProps = {
  imageSrc: string;
  title: string;
  text?: string;
  buttonLabel?: string;
   buttonHref?: string; 
  onButtonClick?: () => void;
  widthRem?: number;           // <-- lägg till
  className?: string; 
};

export default function cardholder({
  imageSrc,
  title,
  text,
  buttonLabel = "Läs mer",
  buttonHref,
  onButtonClick,
  widthRem = 18,
  className = "",
}: CardholderProps) {
  return (
    <Card style={{ width: `${widthRem}rem` }} className={className}>
      <Card.Img variant="top" src={imageSrc} alt={title}
      style={{width: "100%", height: "150px", objectFit: "contain"}}/>
      <Card.Body>
        <Card.Title>
          {title}
        </Card.Title>
        {text && <Card.Text>{text}</Card.Text>}

         {buttonHref ? (
          <Button as="a" href={buttonHref} variant="primary">
            {buttonLabel}
          </Button>
          ) : onButtonClick ? (
            <Button onClick={onButtonClick} variant="primary">
              {buttonLabel}
            </Button>
            ) : null}
      </Card.Body>
    </Card>
  );
}

   
